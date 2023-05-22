import { Schema, model } from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export interface AdminInterface {
	email: string;
	roles: string[];
	password: string;
	maxSessions: number;
	sessions?: {
		authToken: string;
		sessionId: string;
	}[];
}

const adminSchema: Schema = new Schema(
	{
		email: {
			type: String,
			required: true,
			unique: true,
			minlength: 5,
			maxlength: 50,
		},
		roles: {
			type: Array,
			required: true,
			default: ["admin"],
		},
		password: {
			type: String,
			required: true,
			minlength: 8,
		},
		maxSessions: {
			type: Number,
			required: true,
			default: 5,
		},
		sessions: [
			{
				authToken: {
					type: String,
					required: true,
				},
				sessionId: {
					type: String,
					required: true,
				},
			},
		],
	},
	{ timestamps: true, collection: "admin-data" }
);

adminSchema.pre("save", async function (next) {
	if (!this.isModified("password")) next();
	try {
		const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
		const salt = await bcrypt.genSalt(saltRounds);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error: any) {
		next(error);
	}
})

adminSchema.methods.checkPassword = async function (password: string) {
	return await bcrypt.compare(password, this.password);
}

adminSchema.methods.generateAuthToken = async function () {
	try {
		let session: {
			authToken?: string | undefined;
			sessionId?: string | undefined;
			refreshToken?: string | undefined;
		} = new Object();
		session.authToken = jwt.sign(
			{
				email: this.email,
				_id: this._id.toString(),
				role: this.role,
				date: new Date(Date.now()),
			},
			String(process.env.JWT_SECRET_KEY),
			{ expiresIn: Number(process.env.COOKIE_MAX_AGE) }
		);
		session.sessionId = crypto.randomUUID();
		const refreshToken = jwt.sign(
			{
				_id: this._id.toString(),
				roles: this.roles,
			},
			String(process.env.JWT_SECRET_KEY),
			{ expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRY) }
		);
		let prevSessions = this.sessions;
		const maxSessions = this.maxSessions;
		const activeSessions = prevSessions.length;
		if (maxSessions > activeSessions) {
			this.sessions = this.sessions.concat(session);
		} else {
			for (let i = 0; i < activeSessions - maxSessions + 1; i++) {
				this.sessions.shift();
			}
			this.sessions = this.sessions.concat(session);
		}
		await this.save();
		session.refreshToken = refreshToken;
		return session;
	} catch (error) {
		return error
	}
};

adminSchema.methods.deleteAuthTokens = async function () {
	try {
		const newSessionsArray = this.sessions || [];
		newSessionsArray.pop();
		this.sessions = newSessionsArray;
		await this.save();
	} catch (error) {
		return error
	}
};

export default model("Admin", adminSchema);
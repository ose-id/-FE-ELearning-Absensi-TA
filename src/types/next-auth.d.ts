import { DefaultSession, DefaultUser } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            email: string;
            username: string;
            fullName: string;
            role_nid: number;
            vrole_name: string;
            vrole_code: string;
            isActive: boolean;
            mustChangePassword?: boolean;
        } & DefaultSession["user"];
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
    }

    interface User extends DefaultUser {
        id: string;
        email: string;
        username: string;
        fullName: string;
        role_nid: number;
        vrole_name: string;
        vrole_code: string;
        isActive: boolean;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        mustChangePassword?: boolean;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        email: string;
        username: string;
        fullName: string;
        role_nid: number;
        vrole_name: string;
        vrole_code: string;
        isActive: boolean;
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
        mustChangePassword?: boolean;
    }
}

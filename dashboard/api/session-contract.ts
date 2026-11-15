export const SESSION_COOKIE_NAME = "lapis_admin_session";

export interface SessionUser {
  id: string;
  email: string;
  role: string | number;
}

export interface DashboardSession {
  user: SessionUser;
  expiresOn: string;
}

import { removeAdmin, revokeSession, signOutOtherSessions } from "@/app/admin/actions";
import { AddAdminForm } from "@/components/admin/AddAdminForm";
import { ConfirmButton, secondaryButtonClass } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/auth";
import { listAdmins, listSessions } from "@/lib/data";

export const instant = false;

export default async function SecurityPage() {
  const me = await requireAdmin();
  const [adminList, sessions] = await Promise.all([listAdmins(), listSessions()]);
  const others = sessions.filter((s) => s.id !== me.sessionId);

  return (
    <>
      <h1 className="text-3xl font-medium tracking-tight">Security</h1>
      <p className="mt-1 text-sm text-muted">
        Admins sign in with Google. There are no passwords to leak: only the emails below can get in.
      </p>

      <section className="mt-10 rounded-2xl border border-line bg-card p-6">
        <h2 className="text-lg font-medium">Admins</h2>
        <p className="mt-1 text-sm text-muted">
          To hand the panel over, add the new owner&apos;s Google email, let them sign in, then remove yourself.
        </p>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {adminList.map((admin) => {
            const isMe = admin.id === me.id;
            return (
              <li key={admin.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {admin.email}
                    {isMe && <span className="ml-2 text-xs text-muted">(you)</span>}
                  </p>
                  <p className="text-xs text-muted">
                    {admin.lastLoginAt ? `Last sign-in ${formatDate(admin.lastLoginAt)}` : "Hasn't signed in yet"}
                  </p>
                </div>
                {adminList.length > 1 && (
                  <ConfirmButton
                    action={removeAdmin.bind(null, admin.id)}
                    message={
                      isMe
                        ? "Remove your own access? You will be signed out and can't sign in again unless another admin adds you back."
                        : `Remove ${admin.email}? They will be signed out everywhere immediately.`
                    }
                  >
                    {isMe ? "Remove me" : "Remove"}
                  </ConfirmButton>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-6">
          <AddAdminForm />
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-line bg-card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-medium">Signed-in sessions</h2>
            <p className="mt-1 text-sm text-muted">
              Sessions end after 12 hours of inactivity and always after 7 days.
            </p>
          </div>
          {others.length > 0 && (
            <ConfirmButton
              action={signOutOtherSessions}
              message="Sign out every other browser, for all admins?"
            >
              Sign out all other sessions
            </ConfirmButton>
          )}
        </div>
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {sessions.map((s) => {
            const isCurrent = s.id === me.sessionId;
            return (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm">
                    {describeDevice(s.userAgent)}
                    {isCurrent && <span className="ml-2 text-xs text-emerald-400">this browser</span>}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {[s.email, s.ip, `active ${formatDate(s.lastSeenAt)}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <ConfirmButton
                  action={revokeSession.bind(null, s.id)}
                  message={isCurrent ? "Sign out of this browser?" : "Sign out this session?"}
                  className={secondaryButtonClass}
                >
                  Sign out
                </ConfirmButton>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

const formatDate = (d: Date) =>
  d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }) + " UTC";

// A rough, readable label is enough here; the full user agent is in the database.
function describeDevice(ua: string) {
  const browser = /Edg\//.test(ua)
    ? "Edge"
    : /Chrome\//.test(ua)
      ? "Chrome"
      : /Firefox\//.test(ua)
        ? "Firefox"
        : /Safari\//.test(ua)
          ? "Safari"
          : "Browser";
  const os = /iPhone|iPad/.test(ua)
    ? "iOS"
    : /Android/.test(ua)
      ? "Android"
      : /Mac OS X/.test(ua)
        ? "macOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Linux/.test(ua)
            ? "Linux"
            : "";
  return os ? `${browser} on ${os}` : browser;
}

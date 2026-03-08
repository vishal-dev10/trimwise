

## Plan: Auto-Redirect Admin Users + Admin Navigation Link for Regular Users

### What Changes

**1. Create `src/hooks/use-user-role.ts`** — a reusable hook that checks if the logged-in user has the `admin` role via the `has_role` RPC. Returns `{ isAdmin, loading }`. This is separate from `useAdminGuard` (which redirects) — this one just queries the role without side effects.

**2. Edit `src/pages/Index.tsx`** — After auth loads, call `useUserRole()`. If the user is an admin, `navigate('/admin', { replace: true })` immediately instead of showing splash/onboarding/car grid. Regular users continue to the normal flow unchanged.

**3. Edit `src/components/admin/AdminLayout.tsx`** — Add a "Back to App" link in the sidebar so admin users can still access the main user-facing app if needed. Add a sign-out button in the sidebar footer.

**4. Edit `src/pages/AuthPage.tsx`** — After successful login, check the user's role. If admin, redirect to `/admin`. If regular user, redirect to `/` (which handles the normal flow). This handles the case where a user logs in from the `/auth` page directly.

### Technical Details

- `useUserRole` hook calls `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })` once on mount when user is available
- The redirect in `Index.tsx` happens inside a `useEffect` that depends on the role check completing
- Loading state is shown while the role check is in progress (same spinner already used)
- `useAdminGuard` (existing) continues to protect admin routes from direct URL access by non-admins
- No database changes needed

### Files to Create/Edit
1. **Create** `src/hooks/use-user-role.ts`
2. **Edit** `src/pages/Index.tsx` — add admin redirect logic
3. **Edit** `src/pages/AuthPage.tsx` — post-login admin redirect
4. **Edit** `src/components/admin/AdminLayout.tsx` — add "Back to App" + sign-out links


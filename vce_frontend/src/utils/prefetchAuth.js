const loaders = {
  login: () => import('../pages/Login'),
  register: () => import('../pages/Register'),
  reset: () => import('../pages/PasswordResetRequest'),
};

export function prefetchAuth(page) {
  // Navigation can retry normally if a speculative download fails.
  void loaders[page]().catch(() => {});
}


export const up = (pgm) => {
  pgm.addColumn('users', {
    role: {
      type: 'text',
      notNull: true,
      default: 'user',
    },
  });

  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('user', 'admin')",
  });
};

export const down = (pgm) => {
  pgm.dropConstraint('users', 'users_role_check');
  pgm.dropColumn('users', 'role');
};

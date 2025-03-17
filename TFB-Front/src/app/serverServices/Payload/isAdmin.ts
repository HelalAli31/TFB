import getPayload from './getPayload';

export default function getIsAdmin() {
  const user = getPayload();
  if (!user) return;
  const role = user.data.role;
  if (!role) return;
  const isAdmin = role === 'admin' ? true : false;
  return isAdmin;
}

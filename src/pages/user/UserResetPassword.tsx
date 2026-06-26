import { Role } from '../../config/constant/role';
import ResetPasswordForm from '@/components/shared/ResetPasswordForm';
import { useParams } from 'react-router-dom';

const UserResetPassword = () => {
  const { token } = useParams();

  return <ResetPasswordForm role={Role.USER} token={token} />;
};

export default UserResetPassword;

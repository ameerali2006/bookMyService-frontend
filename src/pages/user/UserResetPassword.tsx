import ResetPasswordForm from '@/components/shared/ResetPasswordForm';
import { useParams } from 'react-router-dom';

const UserResetPassword = () => {
  const { token } = useParams();

  return <ResetPasswordForm role="user" token={token} />;
};

export default UserResetPassword;

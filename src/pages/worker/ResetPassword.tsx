import ResetPasswordForm from '@/components/shared/ResetPasswordForm';
import { useParams } from 'react-router-dom';

const WorkerResetPassword = () => {
  const { token } = useParams();

  return <ResetPasswordForm role="worker" token={token} />;
};

export default WorkerResetPassword;

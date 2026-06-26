import { Role } from '../../config/constant/role';
import ForgotPasswordForm from '@/components/shared/ForgotPasswordForm';

const UserForgotPassword = () => <ForgotPasswordForm role={Role.USER} />;
export default UserForgotPassword;

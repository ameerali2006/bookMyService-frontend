import { authService } from '@/api/AuthService';
import Login from '@/components/shared/Login'
import { addAdmin } from '@/redux/slice/adminTokenSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
      const navigate = useNavigate();
      const dispatch = useDispatch();

      const handleAdminLogin = async (values: {
        email: string;
        password: string;
      }) => {
        const response = await authService.adminLogin( {...values,role:'admin'});
       
        console.log(response.data.success);

        if (response.data.success) {
          dispatch(addAdmin(response.data.admin));
          navigate("/admin/dashboard");
          return {success:true,message:"successfully login"}
        } else {
          throw new Error("Invalid credentials");
        }
      };
  return (
    <>
      <Login onSubmit={handleAdminLogin} role="admin" />
    </>
  );
}

export default LoginPage
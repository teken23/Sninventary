
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LoginForm from './login/login-form';

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#70d6ff]/20 via-[#ff70a6]/10 to-[#ffd670]/20">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <img 
              src="https://cdn.abacus.ai/images/66dce43c-72eb-477d-b179-edfdb999739c.png" 
              alt="S&N Logo" 
              className="h-24 w-24 mx-auto mb-4 object-contain"
            />
            <h1 className="text-3xl font-bold text-gray-900">S&N</h1>
            <p className="text-gray-600 mt-2">Sistema de Gestión de Inventario</p>
          </div>

          <LoginForm />
        </div>
      </div>
    </div>
  );
}

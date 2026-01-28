import { SignUp as ClerkSignUp } from '@clerk/clerk-react';

const SignUp = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Google Maps Business Lead Generator
                    </h1>
                    <p className="text-gray-600">Create your account</p>
                </div>
                <ClerkSignUp routing="path" path="/sign-up" signInUrl="/sign-in" />
            </div>
        </div>
    );
};

export default SignUp;

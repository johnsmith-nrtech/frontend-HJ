// const GuestAccountCreation = ({
//   guestEmail,
//   customerName
// }: {
//   guestEmail: string;
//   customerName: string;
// }) => {
//   const [isCreatingAccount, setIsCreatingAccount] = useState(false);
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showAccountForm, setShowAccountForm] = useState(false);

//   const handleCreateAccount = async () => {
//     if (password !== confirmPassword) {
//       toast.error("Passwords do not match");
//       return;
//     }
//     if (password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setIsCreatingAccount(true);
//     try {
//       // Here you would call your account creation API
//       // For now, we'll just show a success message
//       toast.success("Account created successfully! You can now login with your email.");
//       setShowAccountForm(false);
//     } catch {
//       toast.error("Failed to create account. Please try again.");
//     } finally {
//       setIsCreatingAccount(false);
//     }
//   };

//   if (!showAccountForm) {
//     return (
//       <div className="mt-8 rounded-lg bg-[#f8f9fa] p-6 border border-[#e9ecef]">
//         <h3 className="mb-3 text-lg font-semibold text-[#222222]">
//           Create an Account to Track Your Orders
//         </h3>
//         <p className="mb-4 text-sm text-[#666666]">
//           Save your information for faster checkout next time and easily track all your orders.
//         </p>
//         <div className="flex gap-3">
//           <Button
//             onClick={() => setShowAccountForm(true)}
//             className="bg-[#007bff] hover:bg-[#0056b3] text-white"
//           >
//             Create Account
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => window.location.href = "/products"}
//             className="border-[#007bff] text-[#007bff] hover:bg-[#007bff] hover:text-white"
//           >
//             Continue Shopping
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="mt-8 rounded-lg bg-white p-6 border border-[#dee2e6]">
//       <h3 className="mb-4 text-lg font-semibold text-[#222222]">
//         Create Your Account
//       </h3>
//       <div className="space-y-4">
//         <div>
//           <Label htmlFor="account-email" className="text-sm font-medium text-[#666666]">
//             Email Address
//           </Label>
//           <Input
//             id="account-email"
//             type="email"
//             value={guestEmail}
//             disabled
//             className="rounded-full border-[#999] bg-gray-50"
//           />
//         </div>
//         <div>
//           <Label htmlFor="account-name" className="text-sm font-medium text-[#666666]">
//             Full Name
//           </Label>
//           <Input
//             id="account-name"
//             value={customerName}
//             disabled
//             className="rounded-full border-[#999] bg-gray-50"
//           />
//         </div>
//         <div>
//           <Label htmlFor="account-password" className="text-sm font-medium text-[#666666]">
//             Password
//           </Label>
//           <Input
//             id="account-password"
//             type="password"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             className="rounded-full border-[#999]"
//             placeholder="Enter a secure password"
//           />
//         </div>
//         <div>
//           <Label htmlFor="confirm-password" className="text-sm font-medium text-[#666666]">
//             Confirm Password
//           </Label>
//           <Input
//             id="confirm-password"
//             type="password"
//             value={confirmPassword}
//             onChange={(e) => setConfirmPassword(e.target.value)}
//             className="rounded-full border-[#999]"
//             placeholder="Confirm your password"
//           />
//         </div>
//         <div className="flex gap-3 pt-2">
//           <Button
//             onClick={handleCreateAccount}
//             disabled={isCreatingAccount || !password || !confirmPassword}
//             className="bg-[#007bff] hover:bg-[#0056b3] text-white"
//           >
//             {isCreatingAccount ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Creating Account...
//               </>
//             ) : (
//               "Create Account"
//             )}
//           </Button>
//           <Button
//             variant="outline"
//             onClick={() => setShowAccountForm(false)}
//             disabled={isCreatingAccount}
//             className="border-[#6c757d] text-[#6c757d] hover:bg-[#6c757d] hover:text-white"
//           >
//             Maybe Later
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

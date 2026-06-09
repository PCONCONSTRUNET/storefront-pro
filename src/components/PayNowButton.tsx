import React from 'react';

interface PayNowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
}

export const PayNowButton = ({ onClick, ...props }: PayNowButtonProps) => {
  return (
    <button 
      className="flex justify-center items-center px-6 py-2 h-10 border-none bg-[#ee4d2d] rounded-[4px] cursor-pointer transition-colors duration-200 ease-in hover:bg-[#d73a1e]"
      onClick={onClick}
      {...props}
    >
      <span className="leading-5 text-sm text-white font-sans font-normal">
        Pagar Agora
      </span>
    </button>
  );
}

export default PayNowButton;

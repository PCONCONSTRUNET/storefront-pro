import React from 'react';
import correiosImg from '@/assets/correios-logo.png';

export function CorreiosLogo(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img src={correiosImg} alt="Correios" {...props} />;
}

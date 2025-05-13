 'use client'; 
 import React from 'react';
 import { LanguageProvider } from '../../../app/components/profile/LanguageContext';

 export default function LanguagesLayout({ children }: { children: React.ReactNode }) {
   return (
     <LanguageProvider>
       {children}
     </LanguageProvider>
   );
 }
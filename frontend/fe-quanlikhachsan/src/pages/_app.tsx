import "@/styles/globals.css";
import type { AppProps } from "next/app";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/router";

// Các trang không sử dụng layout chính
const noLayoutPages = ["/dang-nhap", "/dang-ky", "/admin"];

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  
  // Kiểm tra xem trang hiện tại có nên sử dụng layout không
  const shouldUseLayout = !noLayoutPages.some(page => 
    router.pathname === page || router.pathname.startsWith(`${page}/`)
  );
  
  if (shouldUseLayout) {
    return (
      <MainLayout>
        <Component {...pageProps} />
      </MainLayout>
    );
  }
  
  return <Component {...pageProps} />;
}

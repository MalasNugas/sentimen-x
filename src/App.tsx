import { Routes, Route, Link } from "react-router-dom";
import Landing from "@/pages/Landing";
import DashboardLayout from "@/pages/DashboardLayout";
import DashboardHome from "@/pages/dashboard/Home";
import Dataset from "@/pages/dashboard/Dataset";
import Analisis from "@/pages/dashboard/Analisis";
import Hasil from "@/pages/dashboard/Hasil";
import Tentang from "@/pages/dashboard/Tentang";

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Halaman tidak ditemukan</h2>
        <Link to="/" className="mt-6 inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<DashboardHome />} />
        <Route path="dataset" element={<Dataset />} />
        <Route path="analisis" element={<Analisis />} />
        <Route path="hasil" element={<Hasil />} />
        <Route path="tentang" element={<Tentang />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

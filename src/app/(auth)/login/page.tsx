"use client";

import { LoginForm } from "@/components/auth/login-form";
import Image from "next/image";
import { motion } from "framer-motion";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <motion.div
        className="flex-1 flex flex-col justify-center items-center p-8 lg:p-12 bg-gradient-to-br from-primary-700 to-primary-900 order-first lg:order-last"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative w-full max-w-md aspect-square flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl opacity-30"></div>
          <Image
            src="/logo-upnvj.png"
            alt="UPNVJ Logo"
            width={240}
            height={240}
            className="relative z-10"
            priority
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center mt-8 text-white max-w-md"
        >
          <h2 className="text-3xl font-serif font-bold mb-4">
            Universitas Pembangunan Nasional Veteran Jakarta
          </h2>
          <p className="text-white/80 text-lg">
            Fakultas Ilmu Komputer - Sistem Layanan Terpadu
          </p>
        </motion.div>
      </motion.div>

      {/* Login Section */}
      <div className="flex-1 flex flex-col justify-center p-6 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-8">
            <div className="lg:hidden flex justify-center mb-6">
              <Image
                src="/logo-upnvj.png"
                alt="UPNVJ Logo"
                width={80}
                height={80}
                priority
              />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif">
              Service Desk FIK
            </h1>
            <p className="mt-2 text-muted-foreground">
              Sistem Layanan Terpadu Fakultas Ilmu Komputer
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-card rounded-xl shadow-lg p-6 border border-border/50"
          >
            <LoginForm />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

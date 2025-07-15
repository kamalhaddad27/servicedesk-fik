import { PrismaClient, RoleUser, StaffDepartment } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai proses seeding...");

  // Hash password default untuk semua user
  const defaultPassword = await bcrypt.hash("user123", 10);

  // Data Admin
  const adminsToSeed = [
    {
      name: "Super Admin",
      email: "admin@university.ac.id",
      phone: "081200000001",
      role: RoleUser.admin,
      nip: "ADMIN001",
      position: "IT Administrator",
    },
  ];

  // Data Staff
  const staffToSeed = [
    {
      name: "Budi Staff Lab",
      email: "budi.staff@university.ac.id",
      phone: "081200000002",
      role: RoleUser.staff,
      nip: "STAF001",
      position: "Kepala Laboratorium",
      department: StaffDepartment.LAB,
    },
    {
      name: "Citra Staff TU",
      email: "citra.tu@university.ac.id",
      phone: "081200000003",
      role: RoleUser.staff,
      nip: "STAF002",
      position: "Staff Administrasi",
      department: StaffDepartment.TU,
    },
    {
      name: "wahyu Staff Rektorat",
      email: "wahyu.rektorat@university.ac.id",
      phone: "081210000003",
      role: RoleUser.staff,
      nip: "STAF003",
      position: "Kepala Staff",
      department: StaffDepartment.REKTORAT,
    },
  ];

  // Data User Biasa (Mahasiswa dan dosen)
  const regularUsersToSeed = [
    {
      name: "Dian Mahasiswa",
      email: "dian.mahasiswa@student.university.ac.id",
      phone: "081200000004",
      role: RoleUser.user,
      nim: "123456789",
      academicYear: "2022",
    },
    {
      name: "Joko Dosen",
      email: "Joko.Dosen@student.university.ac.id",
      phone: "081200000005",
      role: RoleUser.user,
      nip: "123456789",
    },
  ];

  // Gabungkan semua data menjadi satu array
  const allUsers = [...adminsToSeed, ...staffToSeed, ...regularUsersToSeed];

  // Looping dan buat user menggunakan upsert
  for (const userData of allUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email }, // Cari user berdasarkan email
      update: {}, // Jika user sudah ada, jangan lakukan apa-apa
      create: {
        ...userData,
        password: defaultPassword,
      },
    });
    console.log(`User dibuat/diperbarui: ${user.name} (${user.email})`);
  }

  console.log("Seeding selesai. ");
}

main()
  .catch((e) => {
    console.error("Terjadi error saat seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

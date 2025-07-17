import {
  PriorityTicket,
  PrismaClient,
  RoleUser,
  StaffDepartment,
  StatusTicket,
} from "@prisma/client";
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

  // SEEDING CATEGORY DAN SUBCATEGORY
  const categoriesData = [
    {
      name: "Hardware",
      subcategories: [
        "Komputer/Laptop",
        "Printer",
        "Proyektor",
        "Perangkat Jaringan",
      ],
    },
    {
      name: "Software",
      subcategories: [
        "Aplikasi Error",
        "Instalasi Software",
        "Update Sistem Operasi",
      ],
    },
    {
      name: "Akun & Akses",
      subcategories: ["Reset Password", "Aktivasi Akun", "Hak Akses Folder"],
    },
  ];

  for (const catData of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: catData.name },
      update: {},
      create: { name: catData.name },
    });
    console.log(`✅ Kategori di-upsert: ${category.name}`);

    if (catData.subcategories && catData.subcategories.length > 0) {
      for (const subName of catData.subcategories) {
        await prisma.subcategory.upsert({
          where: {
            name_categoryId: { name: subName, categoryId: category.id },
          },
          update: {},
          create: {
            name: subName,
            categoryId: category.id,
          },
        });
      }
    }
  }

  // --- Ambil data master yang baru dibuat untuk seeding tiket ---
  const softwareCategory = await prisma.category.findUnique({
    where: { name: "Software" },
  });
  const hardwareCategory = await prisma.category.findUnique({
    where: { name: "Hardware" },
  });
  const instalasiSubcategory = await prisma.subcategory.findFirst({
    where: { name: "Instalasi Software" },
  });
  const proyektorSubcategory = await prisma.subcategory.findFirst({
    where: { name: "Proyektor" },
  });

  // SEED TICKER
  const adminUser = await prisma.user.findUnique({
    where: { email: "admin@university.ac.id" },
  });
  const staffLabUser = await prisma.user.findUnique({
    where: { email: "budi.staff@university.ac.id" },
  });
  const staffTuUser = await prisma.user.findUnique({
    where: { email: "citra.tu@university.ac.id" },
  });
  const mahasiswaUser = await prisma.user.findUnique({
    where: { email: "dian.mahasiswa@student.university.ac.id" },
  });

  // Pastikan semua user, kategori, dan subkategori dibuat sebelum melanjutkan
  if (
    !mahasiswaUser ||
    !staffTuUser ||
    !staffLabUser ||
    !adminUser ||
    !softwareCategory ||
    !hardwareCategory ||
    !instalasiSubcategory ||
    !proyektorSubcategory
  ) {
    throw new Error(
      "Satu atau lebih data master untuk seed tiket tidak ditemukan."
    );
  }

  // Data tiket yang akan di-seed
  const ticketsToSeed = [
    {
      subject: "Permintaan Instalasi Software SPSS",
      description:
        "Saya memerlukan software SPSS versi terbaru untuk mata kuliah statistik.",
      status: StatusTicket.progress,
      priority: PriorityTicket.low,
      department: "Laboratorium Komputer",
      type: "Permintaan Layanan",
      userId: mahasiswaUser.id,
      assignedToId: staffLabUser.id,
      categoryId: softwareCategory.id,
      subcategoryId: instalasiSubcategory.id,
    },
    {
      subject: "LCD Proyektor di Ruang Kelas 101 Mati",
      description: "Proyektor di ruang 101 tidak mau menyala sama sekali.",
      status: StatusTicket.done,
      priority: PriorityTicket.high,
      department: "Sarana & Prasarana",
      type: "Laporan Insiden",
      userId: staffTuUser.id,
      assignedToId: staffTuUser.id,
      categoryId: hardwareCategory.id,
      subcategoryId: proyektorSubcategory.id,
    },
  ];

  for (const ticketData of ticketsToSeed) {
    const ticket = await prisma.ticket.create({
      data: ticketData,
    });
    console.log(`✅ Tiket dibuat: "${ticket.subject}"`);
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

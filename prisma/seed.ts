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

  // Pastikan semua user ditemukan sebelum melanjutkan
  if (!adminUser || !staffLabUser || !staffTuUser || !mahasiswaUser) {
    throw new Error(
      "Satu atau lebih pengguna tidak ditemukan. Jalankan seed user terlebih dahulu."
    );
  }

  // Data tiket yang akan di-seed
  const ticketsToSeed = [
    {
      subject: "Tidak bisa akses Wi-Fi di Perpustakaan",
      description:
        "Koneksi Wi-Fi 'Uni-Hotspot' terus menerus terputus saat saya coba hubungkan dari area perpustakaan lantai 2.",
      status: StatusTicket.pending,
      priority: PriorityTicket.medium,
      department: "IT Support",
      category: "Jaringan",
      subcategory: "Wi-Fi",
      type: "Permintaan Layanan",
      userId: mahasiswaUser.id, // Tiket dibuat oleh mahasiswa
      assignedToId: staffLabUser.id, // Ditugaskan ke staf lab
    },
    {
      subject: "Permintaan Instalasi Software SPSS",
      description:
        "Saya memerlukan software SPSS versi terbaru untuk mata kuliah statistik. Mohon bantuannya untuk diinstal di komputer lab 3.",
      status: StatusTicket.progress,
      priority: PriorityTicket.low,
      department: "Laboratorium Komputer",
      category: "Software",
      subcategory: "Instalasi",
      type: "Permintaan Layanan",
      userId: mahasiswaUser.id,
      assignedToId: staffLabUser.id,
    },
    {
      subject: "LCD Proyektor di Ruang Kelas 101 Mati",
      description:
        "Proyektor di ruang 101 tidak mau menyala sama sekali. Sudah coba ganti kabel power tapi tetap tidak berhasil.",
      status: StatusTicket.done,
      priority: PriorityTicket.hight,
      department: "Sarana & Prasarana",
      category: "Hardware",
      subcategory: "Proyektor",
      type: "Laporan Insiden",
      userId: staffTuUser.id, // Tiket dibuat oleh staf TU
      assignedToId: adminUser.id, // Ditugaskan ke admin
    },
    {
      subject: "Error saat membuka Sistem Informasi Akademik",
      description:
        "Saat saya mencoba login ke SIA, muncul pesan error '503 Service Unavailable'.",
      status: StatusTicket.pending,
      priority: PriorityTicket.urgent,
      department: "IT Support",
      category: "Aplikasi",
      subcategory: "Sistem Informasi",
      type: "Laporan Insiden",
      userId: mahasiswaUser.id,
      // Tiket ini belum di-assign, jadi assignedToId null
    },
  ];

  // Looping dan buat tiket menggunakan create
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

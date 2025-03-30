import { item_format, PrismaClient, user_role } from '@prisma/client';
import { release } from 'os';
const prisma = new PrismaClient();

async function main() {
  // 🔹 1. Insert Authors FIRST
  await createUsers();
  await createAuthors();
  await createCategories();
  await createGenres();
  await createBooks();

  console.log('✅ Seed data inserted successfully!');
}

const USER_SEED = [
  {
    id: 'bb75931b-d592-42a8-90e2-f73cf734034a',
    email: 'koyeb@chyra.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$Blm7ZrWFbsDnUBN9EOxk3Q$zGqjLfudcu7hiQceGtLhaOfBoAtw+CCrpgZcC47iO8A',
    firstName: 'Koyeb',
    lastName: '',
    avatar: 'https://avatar.iran.liara.run/public/32',
    role: user_role.user,
    userId: '6695a64c-f054-499c-a4f1-86d47d1e37fd',
  },
  {
    id: '6dd84019-1b9a-41fd-bda9-0c0343faa57c',
    email: 'atsh@chyra.com',
    password:
      '$argon2id$v=19$m=65536,t=3,p=4$Blm7ZrWFbsDnUBN9EOxk3Q$zGqjLfudcu7hiQceGtLhaOfBoAtw+CCrpgZcC47iO8A',
    firstName: 'anh try',
    lastName: 'say hi',
    avatar: 'https://avatar.iran.liara.run/public/32',
    role: user_role.user,
    userId: '1cac423d-e133-4db2-82fb-eff8c6ce915f',
  },
];
const createUsers = async () => {
  const identities = USER_SEED.map((user) => ({
    id: user.id,
    email: user.email,
    password: user.password,
    role: user.role,
    userId: user.userId,
    user: {
      connect: {
        id: user.userId,
      },
    },
  }));
  const users = USER_SEED.map((user) => ({
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    avatar: user.avatar,
  }));
  try {
    await prisma.user.createMany({ data: users, skipDuplicates: true });
    await prisma.userIdentity.createMany({
      data: identities,
      skipDuplicates: true,
    });
    console.log('✅ User data inserted successfully!');
  } catch (error) {
    console.error('Error inserting user data:', error);
  }
};

const createAuthors = async () => {
  const authors = [
    {
      id: '01943bac-f804-7496-b2f2-d79b780da7cd',
      name: 'J.K. Rowling',
      bio: 'J.K. Rowling is a British author, best known for writing the Harry Potter fantasy series. The series has gained worldwide attention, won multiple awards, and sold more than 500 million copies. She has also written under the pseudonym Robert Galbraith for her crime fiction works.',
      birthDate: '1965-07-31',
      avatar:
        'https://res.cloudinary.com/dm9zzbmte/image/upload/w_400,h_400,c_fill/v1736167893/author-images/h8qrbbwnx2p5nuuryknu.png',
      country: 'United Kingdom',
    },
    {
      id: '019432f8-66a4-7676-a60a-eda03d4210f1',
      name: 'Dale Carnegie',
      avatar:
        'https://res.cloudinary.com/dm9zzbmte/image/upload/w_200,h_200,c_fill,f_auto,q_auto/v1739961964/author-images/osv0un1pkzml4tgac0ph.jpg',
      birthDate: '1888-11-24',
      deathDate: '1955-11-01',
      bio: "Dale Carnegie was an American writer and lecturer, and the developer of courses in self-improvement, salesmanship, corporate training, public speaking, and interpersonal skills. He is best known for his book 'How to Win Friends and Influence People'.",
      country: 'United States',
    },
  ];
  try {
    await prisma.author.createMany({ data: authors, skipDuplicates: true });
    console.log('✅ Author data inserted successfully!');
  } catch (error) {
    console.error('Error inserting author data:', error);
  }
};

const createCategories = async () => {
  const categories = [
    {
      id: 'dfc417d4-d8e3-4f73-978c-3e6a18f36c72',
      name: 'Văn học',
      description:
        'Khám phá chiều sâu tâm hồn con người qua những câu chuyện đầy cảm xúc, phản ánh chân thực xã hội và giá trị văn hóa trong từng trang văn học.',
      cover:
        'https://res.cloudinary.com/dm9zzbmte/image/upload/w_300,h_300,c_fill/v1736166419/category-covers/hpd7olnwscs2uotgk6ze.jpg',
    },
    {
      id: '3e4c6935-5bd6-455d-a6b8-eacf07d4e599',
      name: 'Kỹ năng sống',
      description:
        'Khám phá những kỹ năng cần thiết để sống tự tin và thành công trong cuộc sống hiện đại, từ giao tiếp đến quản lý thời gian và tài chính cá nhân.',
      cover:
        'https://res.cloudinary.com/dm9zzbmte/image/upload/w_300,h_300,c_fill,f_auto,q_auto/v1736022609/author-images/cz448od7v66hcczfsc3i.jpg',
    },
  ];
  try {
    await prisma.category.createMany({
      data: categories,
      skipDuplicates: true,
    });
    console.log('✅ Category data inserted successfully!');
  } catch (error) {
    console.error('Error inserting categories data:', error);
  }
};

const createGenres = async () => {
  const genres = [
    {
      id: 'd613e7b8-d712-460a-98c8-dc4d9f76261b',
      name: 'Adventure',
    },
    {
      id: '87de6a25-62dd-4882-923c-347505efc963',
      name: 'Kids',
    },
    {
      id: '293978bd-d410-4e29-9fce-5bfb822f0f19',
      name: 'Fantasy',
    },
    {
      id: 'c161d99f-fc4a-4256-b674-1f77232893c7',
      name: 'Self-help',
    },
    {
      id: '49b79a88-5f09-4821-ab64-ae69db502720',
      name: 'Modivational',
    },
  ];
  try {
    await prisma.genre.createMany({
      data: genres,
      skipDuplicates: true,
    });
    console.log('✅ Genre data inserted successfully!');
  } catch (error) {
    console.error('Error inserting genres data:', error);
  }
};

const createBooks = async () => {
  const books = [
    {
      id: '68e1c976-8e88-4fa6-949b-9793afdc4b4f',
      cover:
        'http://res.cloudinary.com/dm9zzbmte/image/upload/v1736023117/book-covers/h8sfysd6cqdcpiqcqxwx.jpg',
      title: 'Đắc Nhân Tâm',
      authorId: '019432f8-66a4-7676-a60a-eda03d4210f1',
      categoryId: '3e4c6935-5bd6-455d-a6b8-eacf07d4e599',
      language: 'Tiếng Việt',
      releaseDate: new Date('1936-10-01'),
      digitalItems: [
        {
          format: item_format.pdf,
          url: 'https://cfgzegz7c7mpcywe.public.blob.vercel-storage.com/nhasachmienphi-dac-nhan-tam-HO2nhNLSznJ7vp6TsS0qnWgp8cRMzK.pdf',
          size: 3.0,
        },
      ],
      genreIds: [
        'c161d99f-fc4a-4256-b674-1f77232893c7',
        '49b79a88-5f09-4821-ab64-ae69db502720',
      ],
      description:
        "Cuốn sách kinh điển về nghệ thuật giao tiếp và tạo dựng mối quan hệ, giúp hàng triệu người trên thế giới cải thiện kỹ năng ứng xử, thuyết phục, và đạt được thành công trong cuộc sống. 'Đắc Nhân Tâm' của Dale Carnegie là một kim chỉ nam cho những ai muốn xây dựng mối quan hệ bền vững và thành công.",
      pages: 322,
    },
    {
      id: '7d9672a6-d806-4cdb-b8ea-1a8e8cb7d370',
      cover:
        'https://res.cloudinary.com/dm9zzbmte/image/upload/w_466,c_scale/v1736170562/book-covers/kacrjelofiip0njffamn.jpg',
      title: 'Harry Potter and the Chamber of Secrets',
      authorId: '01943bac-f804-7496-b2f2-d79b780da7cd',
      categoryId: 'dfc417d4-d8e3-4f73-978c-3e6a18f36c72',
      language: 'English',
      releaseDate: new Date('1998-07-02'),
      digitalItems: [
        {
          format: item_format.pdf,
          url: 'https://cfgzegz7c7mpcywe.public.blob.vercel-storage.com/harry-potter/2.%20Harry%20Potter%20and%20the%20Chamber%20of%20Secrets-wr1SYqAghYWNP6bfIYOOuKzYLE25hU.pdf',
          size: 1.0,
        },
      ],
      genreIds: [
        'cd613e7b8-d712-460a-98c8-dc4d9f76261b',
        '87de6a25-62dd-4882-923c-347505efc963',
        '293978bd-d410-4e29-9fce-5bfb822f0f19',
      ],
      description:
        "In the second book of J.K. Rowling's magical series, Harry Potter returns to Hogwarts for his second year and faces a new mystery—the Chamber of Secrets. As dark forces resurface, Harry, Ron, and Hermione must work together to uncover the truth and protect the school from an ancient terror.",
      pages: 259,
    },
  ];
  try {
    await Promise.all(
      books.map(async (book) => {
        const { digitalItems, genreIds, ...bookData } = book;
        await prisma.$transaction(async (prisma) => {
          const book = await prisma.book.createMany({
            data: bookData,
          });

          await prisma.bookGenre.createMany({
            data: genreIds.map((genre) => {
              return {
                bookId: bookData.id,
                genreId: genre,
              };
            }),
          });

          await prisma.bookDigitalItem.createMany({
            data: digitalItems.map((item) => {
              return {
                bookId: bookData.id,
                format: item.format as item_format,
                url: item.url,
                size: item.size,
                md5: '',
                sha256: '',
              };
            }),
          });
        });
      }),
    );
  } catch (error) {
    console.error('Error inserting books data:', error);
  }
};

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

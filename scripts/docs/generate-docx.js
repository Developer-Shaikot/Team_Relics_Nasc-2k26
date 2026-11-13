import fs from 'fs';
import path from 'path';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  ShadingType
} from 'docx';

const outDir = path.resolve('docs/project', 'docx');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Calibri',
          size: 22, // 11pt
          color: '2D3748'
        },
        paragraph: {
          spacing: { line: 280, before: 100, after: 100 }
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1000,
            bottom: 1000,
            left: 1200,
            right: 1200
          }
        }
      },
      children: [
        // Title Block
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: '🚀 নাসা স্পেস অ্যাপস চ্যালেঞ্জ ২০২৬: প্রজেক্ট ডকুমেন্টেশন',
              bold: true,
              size: 34,
              color: '1A365D'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: 'প্রজেক্টের নাম: ',
              bold: true,
              size: 26,
              color: 'DD6B20'
            }),
            new TextRun({
              text: 'Relics of the Red Dust (রিলিক্স অব দ্য রেড ডাস্ট: ইয়ুথ এক্সপ্লোরার)',
              bold: true,
              size: 26,
              color: '2C5282'
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({
              text: 'চ্যালেঞ্জের নাম: Abandoned but Not Forgotten: Storytelling about NASA\'s Discarded Equipment on the Moon and Mars\n',
              italics: true,
              size: 20,
              color: '4A5568'
            }),
            new TextRun({
              text: 'ক্যাটাগরি: Beginner / Youth & Intermediate  |  বিষয়শ্রেণী: Astrophysics, Planets & Moons, Space Exploration',
              size: 18,
              color: '718096'
            })
          ]
        }),

        // Divider
        new Paragraph({
          border: {
            bottom: { color: 'E2E8F0', space: 1, style: BorderStyle.SINGLE, size: 6 }
          },
          spacing: { after: 200 },
          children: []
        }),

        // Section 1
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({
              text: '📌 ১. প্রজেক্টের সারসংক্ষেপ ও মূল ভাবনা (Executive Summary)',
              bold: true,
              size: 26,
              color: '2B6CB0'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: '১৯৬০-এর দশক থেকে নাসা (NASA) চাঁদ, মঙ্গল এবং মহাকাশের গভীরে বিভিন্ন রোভার, ল্যান্ডার ও বৈজ্ঞানিক যন্ত্রপাতি রেখে এসেছে। এসব যন্ত্রপাতি হয়তো তাদের প্রাথমিক মেয়াদ শেষ করেছে, তবে সেগুলো মহাকাশবিজ্ঞানের ইতিহাসে অমূল্য সম্পদ ও স্মৃতিচিহ্ন হিসেবে টিকে আছে।'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: 'আমাদের প্রজেক্ট '
            }),
            new TextRun({
              text: '"Relics of the Red Dust"',
              bold: true,
              color: 'DD6B20'
            }),
            new TextRun({
              text: ' হলো স্কুলপড়ুয়া কিশোর-কিশোরী ও তরুণ মহাকাশপ্রেমীদের জন্য তৈরি একটি ইন্টারেক্টিভ ৩D স্টোরিটেলিং ও সিমুলেশন প্ল্যাটফর্ম। এখানে শিক্ষার্থীরা ২০৮৫ সালের একজন ভবিষ্যৎ প্রত্নতাত্ত্বিক (Martian Archaeologist) হিসেবে মঙ্গলের বুকে অবতরণ করে এবং নাসার কিংবদন্তি রোভার \'অপরচুনিটি\' (MER-B Opportunity)-এর রেখে যাওয়া বৈজ্ঞানিক নিদর্শনগুলো খুঁজে বের করে, ড্রাইভ করে সংগ্রহ করে এবং সেগুলোর পেছনের রোমাঞ্চকর বিজ্ঞান শেখে।'
            })
          ]
        }),

        // Section 2
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 250, after: 120 },
          children: [
            new TextRun({
              text: '🎯 ২. নাসা চ্যালেঞ্জের সাথে সমাধানটির সংযোগ (Challenge Alignment)',
              bold: true,
              size: 26,
              color: '2B6CB0'
            })
          ]
        }),

        // Alignment Table
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  width: { size: 40, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'নাসার চ্যালেঞ্জের শর্ত', bold: true, color: '1A202C' })
                      ]
                    })
                  ]
                }),
                new TableCell({
                  shading: { type: ShadingType.CLEAR, fill: 'EDF2F7' },
                  width: { size: 60, type: WidthType.PERCENTAGE },
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({ text: 'আমাদের তৈরিকৃত সমাধান', bold: true, color: '1A202C' })
                      ]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: '১. নাসার পরিত্যক্ত হার্ডওয়্যারের গল্প বলা', bold: true })]
                    })
                  ]
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: 'অপরচুনিটির ১৫ বছরের ইতিহাস, মঙ্গলে ৪৫.১৬ কিমি দীর্ঘ পথচলা এবং সল ৫১১১-এর শেষ দিনটিকে ৩D গল্পের মাধ্যমে জীবন্ত করে তোলা হয়েছে।' })]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: '২. স্কুলপড়ুয়াদের উপযোগী শিক্ষা ও ভাষা', bold: true })]
                    })
                  ]
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: 'গ্যামিফাইড লেভেল, সহজবোধ্য গল্প, কমপ্যানিয়ন রোবট গাইড, এবং সম্পূর্ণ দ্বিভাষিক (বাংলা ও ইংরেজি) সমর্থন।' })]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: '৩. যন্ত্রপাতির ভূমিকা ও বিজ্ঞান তুলে ধরা', bold: true })]
                    })
                  ]
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: 'রোভারের প্রতিটি বৈজ্ঞানিক ইনস্ট্রুমেন্ট (RAT, Mini-TES, Mössbauer, Pancam, Solar Arrays) সরাসরি ৩D মডেলে স্ক্যান করে শেখার ব্যবস্থা।' })]
                    })
                  ]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: '৪. সায়েন্টিফিক তথ্যের নির্ভুলতা', bold: true })]
                    })
                  ]
                }),
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [new TextRun({ text: 'নাসা পিডিএস (NASA Planetary Data System) এর প্রকৃত অপটিক্যাল টাউ (Tau), সৌরবিদ্যুৎ উৎপাদন ও সল-লগ ব্যবহার করা হয়েছে।' })]
                    })
                  ]
                })
              ]
            })
          ]
        }),

        // Section 3
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 120 },
          children: [
            new TextRun({
              text: '🎮 ৩. প্রধান প্রধান ফিচার ও গেমপ্লে মেকানিক্স (Key Features)',
              bold: true,
              size: 26,
              color: '2B6CB0'
            })
          ]
        }),

        // 3.A
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 150, after: 80 },
          children: [
            new TextRun({
              text: '🏎️ ক. "Drive-to-Explore & Collect" গেম লুপ (৩D রোভার ড্রাইভ)',
              bold: true,
              size: 24,
              color: 'DD6B20'
            })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'বাস্তবধর্মী রোভার ড্রাইভিং: ', bold: true }),
            new TextRun({ text: 'শিক্ষার্থীরা কিবোর্ড (WASD / অ্যারো কি) বা অন-স্ক্রিন ডি-প্যাড দিয়ে মঙ্গলের ঢেউ খেলানো লাল বালুর বুকে রোভার ড্রাইভ করতে পারে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'ডাইনামিক ক্যামেরা ও ওডোমিটার: ', bold: true }),
            new TextRun({ text: 'রোভার চলার সাথে সাথে ৩D ক্যামেরা স্মুথভাবে রোভারকে অনুসরণ করে এবং লাইভ ওডোমিটারে পাড়ি দেওয়া দূরত্ব মিটার ও কিলোমিটারে যোগ হতে থাকে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '৩D লাইট পিলার ও জিপিএস ওয়েপয়েন্ট: ', bold: true }),
            new TextRun({ text: 'মঙ্গলের মাটিতে ৮ মিটার উঁচু ৩D আলোকস্তম্ভ (Light Pillars) সক্রিয় মিশনের নিশান হিসেবে পথ দেখায়। স্ক্রিনের শীর্ষে থাকা লাইভ GPS ট্র্যাকার জানিয়ে দেয় লক্ষ্যবস্তু কত মিটার দূরে আছে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'স্বয়ংক্রিয় প্রক্সিমিটি স্ক্যানার: ', bold: true }),
            new TextRun({ text: 'লক্ষ্যবস্তুর ৩.৫ মিটারের মধ্যে গেলে [E] বাটন চাপার অ্যালার্ট আসে এবং সায়েন্টিফিক তথ্য উন্মোচিত হয়।' })
          ]
        }),

        // 3.B
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: '🔬 খ. ঐতিহাসিক নিদর্শন ও সায়েন্স পেলোড (Archaeological Relics & Science)',
              bold: true,
              size: 24,
              color: 'DD6B20'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'শিক্ষার্থীরা ড্রাইভ করে মোট ৬টি মূল নিদর্শন সংগ্রহ করে:' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '১. Pancam (প্যানক্যাম ক্যামেরা - মিশন ১): ', bold: true }),
            new TextRun({ text: 'মঙ্গলের বুকে অপরচুনিটির চোখ; ১৫ বছরে লাখেরও বেশি ছবি তুলেছে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '২. Hematite Blueberries (মার্শিয়ান ব্লুবেরি - মিশন ২): ', bold: true }),
            new TextRun({ text: 'লোহার ক্ষুদ্র গোলক, যা প্রমাণ করে প্রাচীনকালে মঙ্গলে তরল পানি প্রবাহিত ছিল।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '৩. Diamond RAT Grinder (পাথর কাটার যন্ত্র - মিশন ৩): ', bold: true }),
            new TextRun({ text: 'হীরার গুঁড়া দিয়ে তৈরি চাকা যা পাথরের বাইরের স্তর কেটে ভেতরের তাজা খনিজ উন্মোচন করেছিল।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '৪. Mössbauer Spectrometer (মসবায়ার স্পেকট্রোমিটার - মিশন ৪): ', bold: true }),
            new TextRun({ text: 'গামা-রশ্মির মাধ্যমে জারোসাইট খনিজ বিশ্লেষণ করে অম্লীয় পানির অস্তিত্ব নিশ্চিত করেছিল।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '৫. Sol 5111 High Rim Station (সল ৫১১১ ধূলিঝড় স্টেশন - মিশন ৫): ', bold: true }),
            new TextRun({ text: '২০১৮ সালের বৈশ্বিক ধূলিঝড়ের ইতিহাস যেখানে বায়ুমণ্ডলের অস্বচ্ছতা (Tau) রেকর্ড ১০.৮-এ পৌঁছেছিল।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: '৬. Blackbox Solid-State Core (ব্ল্যাকবক্স মেমোরি কোর - মিশন ৬): ', bold: true }),
            new TextRun({ text: 'রোভারের সলিড-স্টেট ড্রাইভ থেকে অপরচুনিটির শেষ সিগন্যাল ও ডেটা ডিকোড করার অভিজ্ঞতা।' })
          ]
        }),

        // 3.C, D, E
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: '🌪️ গ. সল ৫১১১ টাইম-মেশিন সিমুলেশন (Beer-Lambert Atmospheric Optics)',
              bold: true,
              size: 24,
              color: 'DD6B20'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'শিক্ষার্থীরা স্লাইডার ঘুরিয়ে বা প্লে বাটন চেপে ২০১৮ সালের ভয়াল ধূলিঝড় দেখতে পারে। আকাশ লালচে থেকে ঘন কালো হয়ে যাওয়ার সাথে সাথে সৌরবিদ্যুৎ উৎপাদন ৯০০ Wh থেকে নেমে মাত্র ২২ Wh-এ পৌঁছানোর প্রক্রিয়া শিক্ষার্থীরা নিজে পরীক্ষা করে বুঝতে পারে।' })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: '🏆 ঘ. স্পেস ক্যাডেট একাডেমি, কুইজ ও মাস্টার সার্টিফিকেট',
              bold: true,
              size: 24,
              color: 'DD6B20'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: '৬টি মিশন সম্পন্ন করার পর এবং সায়েন্স কুইজে অংশ নিলে শিক্ষার্থীরা তাদের অর্জিত ব্যাজ দেখতে পারে এবং শেষ পর্যায়ে তাদের নামে একটি ভেরিফায়েড "Martian Archaeologist Certificate" ইস্যু হয়।' })
          ]
        }),

        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 80 },
          children: [
            new TextRun({
              text: '🎬 ঙ. ১২০ সেকেন্ড পিচ শোকেস (Cinematic Pitch Mode)',
              bold: true,
              size: 24,
              color: 'DD6B20'
            })
          ]
        }),
        new Paragraph({
          children: [
            new TextRun({ text: 'নাসা জাজ ও দর্শকদের জন্য প্রজেক্টের পুরো গল্পকে ৪টি অঙ্কে (Act I to IV) অটোমেটিক সিনেমাটিক ক্যামেরা শট, ন্যারেশন ও সাবটাইটেল সহ শোকেস করার মোড রয়েছে।' })
          ]
        }),

        // Section 4 & 5
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 250, after: 120 },
          children: [
            new TextRun({
              text: '🌟 ৪. প্রজেক্টের বিশেষত্ব ও ভবিষ্যৎ পরিকল্পনা (Future Scope)',
              bold: true,
              size: 26,
              color: '2B6CB0'
            })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'পরিত্যক্ত চন্দ্রযানের অন্তর্ভুক্তি: ', bold: true }),
            new TextRun({ text: 'অ্যাপোলো ১১ লুনার মডিউল ও সার্ভেয়ার প্রোব যুক্ত করে চাঁদের গল্পও একইভাবে এক্সপ্লোর করা যাবে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'ডিপ স্পেস মোড (Voyager 1 & 2): ', bold: true }),
            new TextRun({ text: 'সৌরজগতের বাইরে চলে যাওয়া মহাকাশযানের গোল্ডেন রেকর্ড অডিও এবং ইন্টারস্টেলার সায়েন্স যুক্ত করার পরিকল্পনা রয়েছে।' })
          ]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [
            new TextRun({ text: 'ভার্চুয়াল রিয়েলিটি (WebXR / VR): ', bold: true }),
            new TextRun({ text: 'ভিআর হেডসেট পরে ছাত্র-ছাত্রীরা সরাসরি মঙ্গলের মাটিতে হেঁটে হেঁটে রোভার পর্যবেক্ষণ করতে পারবে।' })
          ]
        }),

        // Closing Quote
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 100 },
          shading: { type: ShadingType.CLEAR, fill: 'FFF5F5' },
          children: [
            new TextRun({
              text: '"যদিও তাদের ব্যাটারি ফুরিয়ে গেছে এবং ধুলোয় ঢেকে গেছে তাদের শরীর, কিন্তু তারা যে পথ তৈরি করে দিয়ে গেছে—তাতেই একদিন মানুষ মঙ্গলে পা রাখবে।"\n',
              italics: true,
              bold: true,
              size: 22,
              color: 'C53030'
            }),
            new TextRun({
              text: '— Team Relics of the Red Dust, NASA Space Apps Challenge 2026',
              bold: true,
              size: 20,
              color: '742A2A'
            })
          ]
        })
      ]
    }
  ]
});

const docxPath = path.join(outDir, 'NASA_SPACE_APPS_PROJECT_SUMMARY_BN.docx');
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync(docxPath, buffer);
  console.log(`✅ DOCX created successfully at: ${docxPath}`);
});

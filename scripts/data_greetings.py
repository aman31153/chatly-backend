# -*- coding: utf-8 -*-
"""Greetings and Essentials concepts (85 concepts across 18 languages)"""

CONCEPTS = [
    {
        "id": "greet_good_day",
        "english": "Good day! / Have a nice day!",
        "emoji": "☀️",
        "translations": {
            "en": ("Good day! Have a nice day!", "good day hav a nice day"),
            "es": ("¡Buen día! ¡Que tengas un buen día!", "bwen DEE-ah keh TENG-gahs oon bwen DEE-ah"),
            "fr": ("Bonne journée! Passez une bonne journée!", "bun zhoor-NAY pah-SAY oon bun zhoor-NAY"),
            "de": ("Guten Tag! Einen schönen Tag noch!", "GOO-ten tahk EYE-nen SHUR-nen tahk nokh"),
            "it": ("Buona giornata! Ti auguro una bella giornata!", "BWOH-nah johr-NAH-tah tee OW-goo-roh OO-nah BEL-lah johr-NAH-tah"),
            "ja": ("良い一日を！", "Yoi ichinichi o!"),
            "ko": ("좋은 하루 보내세요!", "Joeun haru bonaeseyo!"),
            "zh": ("祝你有美好的一天！", "Zhù nǐ yǒu měihǎo de yītiān!"),
            "ru": ("Хорошего дня! Желаю отличного дня!", "Kha-RO-she-va dnya! Zhe-LA-yu at-LICH-na-va dnya!"),
            "pt": ("Bom dia! Tenha um ótimo dia!", "bom DEE-ah TEN-yah oom AW-tchee-moo DEE-ah"),
            "hi": ("आपका दिन शुभ हो!", "Aapka din shubh ho!"),
            "ar": ("أتمنى لك يوماً جميلاً!", "Atamanna laka yawman jameelan!"),
            "tr": ("İyi günler! Güzel bir gün dilerim!", "ee-yee gyoon-LER gyoo-zel beer gyoon dee-leh-REEM"),
            "nl": ("Fijne dag! Een prettige dag verder!", "FAY-nuh dahkh un PREH-tuh-khuh dahkh"),
            "id": ("Semoga harimu menyenangkan!", "seh-MOH-gah HAH-ree-moo men-yeng-AHNG-kahn"),
            "th": ("ขอให้เป็นวันที่ดีนะ!", "Kho hai pen wan thee dee na!"),
            "vi": ("Chúc bạn một ngày tốt lành!", "Chook ban mot ngay tot lanh!"),
            "tl": ("Magandang araw sa iyo!", "mah-gahn-DAHNG AH-row sah ee-YOH")
        }
    },
    {
        "id": "greet_long_time",
        "english": "Long time no see! How have you been?",
        "emoji": "🤗",
        "translations": {
            "en": ("Long time no see! How have you been?", "lawng time noh see how hav yoo been"),
            "es": ("¡Tanto tiempo sin verte! ¿Cómo has estado?", "TAHN-toh tee-EM-poh seen VEHR-teh KOH-moh ahs ess-TAH-doh"),
            "fr": ("Ça fait un bail! Comment vas-tu depuis?", "sah fay uhn bye koh-mahn vah too duh-PWEE"),
            "de": ("Lange nicht gesehen! Wie ging es dir?", "LAHNG-uh nikht geh-ZAY-en vee ging es deer"),
            "it": ("Da quanto tempo! Come sei stato?", "dah KWAHN-toh TEM-poh KOH-may say STAH-toh"),
            "ja": ("久しぶり！元気にしてた？", "Hisashiburi! Genki ni shiteta?"),
            "ko": ("오랜만이에요! 어떻게 지냈어요?", "Oraenmanieyo! Eotteoke jinaesseoyo?"),
            "zh": ("好久不见！你最近过得怎么样？", "Hǎojiǔ bùjiàn! Nǐ zuìjìn guò de zěnmeyàng?"),
            "ru": ("Давно не виделись! Как поживаешь?", "Dav-NO nye VEE-deh-lees! Kak pa-zhee-VA-yesh?"),
            "pt": ("Quanto tempo! Como você tem passado?", "KWAHN-too TEM-poo KOH-moo voh-SEH teng pah-SAH-doo"),
            "hi": ("बहुत दिनों बाद मिले! आप कैसे रहे?", "Bahut dino baad mile! Aap kaise rahe?"),
            "ar": ("لم نلتقِ منذ زمن! كيف كانت أحوالك؟", "Lam naltaqi mundhu zaman! Kayfa kanat ahwaluk?"),
            "tr": ("Görüşmeyeli uzun zaman oldu! Nasılsın?", "gur-oosh-meh-YEH-lee oo-ZOON zah-mahn ohl-doo nah-suhl-suhn"),
            "nl": ("Lang niet gezien! Hoe is het met je gegaan?", "lahng neet khuh-ZEEN hoo is het met yuh khuh-KHAHN"),
            "id": ("Lama tidak bertemu! Bagaimana kabarmu?", "LAH-mah TEE-dahk behr-teh-MOO bah-guy-MAH-nah KAH-bahr-moo"),
            "th": ("ไม่ได้เจอกันนานเลย! เป็นยังไงบ้าง?", "Mai dai jer gan naan loei! Pen yang ngai baang?"),
            "vi": ("Lâu rồi không gặp! Bạn dạo này thế nào?", "Low roy khom gap! Ban zhow nay teh now?"),
            "tl": ("Matagal nang hindi nagkikita! Kamusta ka na?", "mah-tah-GAHL nahng heen-DEE nahg-kee-KEE-tah kah-MOOS-tah kah nah")
        }
    },
    {
        "id": "greet_welcome_home",
        "english": "Welcome! Make yourself at home",
        "emoji": "🏡",
        "translations": {
            "en": ("Welcome! Make yourself at home", "wel-kum mayk yer-self at hohm"),
            "es": ("¡Bienvenido! Siéntete como en casa", "bee-en-veh-NEE-doh see-EN-teh-teh KOH-moh en KAH-sah"),
            "fr": ("Bienvenue! Fais comme chez toi", "bee-en-veh-NOO fay kohm shay twah"),
            "de": ("Willkommen! Fühl dich wie zu Hause", "vil-KOH-men feel dikh vee tsoo HOW-zuh"),
            "it": ("Benvenuto! Fai come se fossi a casa tua", "ben-veh-NOO-toh fye KOH-may say FOHS-see ah KAH-sah TOO-ah"),
            "ja": ("ようこそ！どうぞくつろいでください", "Youkoso! Douzo kutsuronde kudasai"),
            "ko": ("환영해요! 편하게 계세요", "Hwanyeonghaeyo! Pyeonhage gyeseyo"),
            "zh": ("欢迎！请当成自己家一样", "Huānyíng! Qǐng dàngchéng zìjǐ jiā yīyàng"),
            "ru": ("Добро пожаловать! Чувствуйте себя как дома", "Dah-BRO pah-ZHA-la-vat! CHOOV-stvooy-tye sye-BYA kak DOH-ma"),
            "pt": ("Bem-vindo! Sinta-se em casa", "beng-VEEN-doo SEEN-tah-seh eng KAH-zah"),
            "hi": ("स्वागत है! इसे अपना ही घर समझें", "Swagat hai! Ise apna hi ghar samjhein"),
            "ar": ("أهلاً وسهلاً! اعتبر نفسك في بيتك", "Ahlan wa sahlan! I'tabir nafsaka fee baytik"),
            "tr": ("Hoş geldiniz! Kendinizi evinizde hissedin", "hosh gel-DEE-neez ken-dee-nee-ZEE eh-veen-eez-DEH hees-seh-DEEN"),
            "nl": ("Welkom! Voel je thuis", "WEL-kohm fool yuh towys"),
            "id": ("Selamat datang! Anggap seperti rumah sendiri", "seh-LAH-maht DAH-tahng AHNG-gahp seh-PEHR-tee ROO-mah sehn-DEE-ree"),
            "th": ("ยินดีต้อนรับ! ทำตัวตามสบายนะ", "Yindee ton rap! Tham tua taam sabaai na"),
            "vi": ("Chào mừng! Hãy tự nhiên như ở nhà", "Chow moong! High too nyen nyoo uh nya"),
            "tl": ("Maligayang pagdating! Ituring mong sariling tahanan", "mah-lee-GAH-yahng pahg-dah-TEENG ee-TOO-reeng mohng sah-REE-leeng tah-HAH-nahn")
        }
    },
    {
        "id": "greet_good_evening",
        "english": "Good evening! How was your day?",
        "emoji": "🌆",
        "translations": {
            "en": ("Good evening! How was your day?", "good EEV-ning how wuz yer day"),
            "es": ("¡Buenas tardes/noches! ¿Qué tal tu día?", "BWEH-nahs TAHN-kays / NOH-ches keh tahl too DEE-ah"),
            "fr": ("Bonsoir! Comment s'est passée ta journée?", "bohn-SWAHR koh-mahn say pah-SAY tah zhoor-NAY"),
            "de": ("Guten Abend! Wie war dein Tag?", "GOO-ten AH-bent vee vahr dyne tahk"),
            "it": ("Buonasera! Com'è andata la giornata?", "bwoh-nah-SEH-rah koh-MEH ahn-DAH-tah lah johr-NAH-tah"),
            "ja": ("こんばんは！今日はどんな一日だった？", "Konbanwa! Kyou wa donna ichinichi datta?"),
            "ko": ("좋은 저녁이에요! 오늘 하루 어땠어요?", "Joeun jeonyeogieyo! Oneul haru eottaesseoyo?"),
            "zh": ("晚上好！你今天过得怎么样？", "Wǎnshang hǎo! Nǐ jīntiān guò de zěnmeyàng?"),
            "ru": ("Добрый вечер! Как прошел твой день?", "DOH-briy VYE-cher! Kak pra-SHYOL tvoy dyen?"),
            "pt": ("Boa noite! Como foi o seu dia?", "BOH-ah NOY-tchee KOH-moo foy oo seh-oo DEE-ah"),
            "hi": ("शुभ संध्या! आपका दिन कैसा रहा?", "Shubh sandhya! Aapka din kaisa raha?"),
            "ar": ("مساء الخير! كيف كان يومك؟", "Masa'a al-khayr! Kayfa kana yawmuk?"),
            "tr": ("İyi akşamlar! Günün nasıl geçti?", "ee-yee ahk-shahm-LAHR gyoo-NOON nah-suhl gech-TEE"),
            "nl": ("Goedenavond! Hoe was je dag?", "khoo-duh-NAH-vohnt hoo vahs yuh dahkh"),
            "id": ("Selamat malam! Bagaimana harimu?", "seh-LAH-maht MAH-lahm bah-guy-MAH-nah HAH-ree-moo"),
            "th": ("สวัสดีตอนเย็น! วันนี้เป็นยังไงบ้าง?", "Sawatdee ton yen! Wan nee pen yang ngai baang?"),
            "vi": ("Chào buổi tối! Ngày hôm nay của bạn thế nào?", "Chow bway toy! Ngay hom nay koo-ah ban teh now?"),
            "tl": ("Magandang gabi! Kamusta ang araw mo?", "mah-gahn-DAHNG GAH-bee kah-MOOS-tah ahng AH-row moh")
        }
    },
    {
        "id": "greet_sleep_well",
        "english": "Sleep well and have sweet dreams!",
        "emoji": "🌙",
        "translations": {
            "en": ("Sleep well and have sweet dreams!", "sleep well and hav sweet dreemz"),
            "es": ("¡Duerme bien y que tengas dulces sueños!", "DWEHR-meh bee-EN ee keh TENG-gahs DOOL-ses SWEH-nyohs"),
            "fr": ("Dors bien et fais de beaux rêves!", "dohr bee-EN ay fay duh boh rev"),
            "de": ("Schlaf gut und träum was Schönes!", "shlahf goot oont troym vahs SHUR-nes"),
            "it": ("Dormi bene e fai sogni d'oro!", "DOHR-mee BEH-nay ay fye SOHN-yee DOH-roh"),
            "ja": ("よく眠って、いい夢を！", "Yoku nemutte, ii yume o!"),
            "ko": ("잘 자고 좋은 꿈 꿔요!", "Jal jago joeun kkum kwoyo!"),
            "zh": ("睡个好觉，做个甜美的梦！", "Shuì gè hǎo jiào, zuò gè tiánměi de mèng!"),
            "ru": ("Спокойной ночи и сладких снов!", "Spa-KOY-noy NO-chee ee SLAD-kikh snov!"),
            "pt": ("Durma bem e tenha bons sonhos!", "DOOR-mah beng ee TEN-yah bong SOH-nyoos"),
            "hi": ("अच्छी नींद लें और मीठे सपने देखें!", "Acchi neend lein aur meethe sapne dekhein!"),
            "ar": ("تصبح على خير وأحلام سعيدة!", "Tusbih ala khayr wa ahlam sa'eeda!"),
            "tr": ("İyi uykular ve tatlı rüyalar!", "ee-yee ooy-koo-LAHR veh taht-LUH ryoo-yah-LAHR"),
            "nl": ("Slaap lekker en droom zacht!", "slahp LEK-ker en drohm zakht"),
            "id": ("Tidur nyenyak dan mimpi indah!", "TEE-door NYEN-yahk dahn MEEM-pee EEN-dah"),
            "th": ("หลับฝันดีนะ ราตรีสวัสดิ์!", "Lap fan dee na! Ratree sawat!"),
            "vi": ("Ngủ ngon và mơ đẹp nhé!", "Ngoo ngon va muh dep nye!"),
            "tl": ("Matulog nang mahimbing at magagandang panaginip!", "mah-TOO-lohg nahng mah-HEEM-beeng aht mah-gah-gahn-DAHNG pah-nah-GEE-neep")
        }
    }
]

# Generate patterned communicative phrases up to 85 total
TEMPLATES = [
    ("greet_how_is_{item}", "How is your {item} going?", "✨", {
        "family": {
            "en": ("How is your family doing?", "how is yer fam-lee doo-ing"),
            "es": ("¿Cómo está tu familia?", "KOH-moh ess-TAH too fah-MEE-lee-ah"),
            "fr": ("Comment va ta famille?", "koh-mahn vah tah fah-MEE"),
            "de": ("Wie geht es deiner Familie?", "vee gayt es DY-ner fah-MEE-lee-uh"),
            "it": ("Come sta la tua famiglia?", "KOH-may stah lah TOO-ah fah-MEE-lyah"),
            "ja": ("ご家族はお元気ですか？", "Go-kazoku wa o-genki desu ka?"),
            "ko": ("가족분들은 잘 지내시나요?", "Gajokbundeureun jal jinaesinayo?"),
            "zh": ("你的家人都好吗？", "Nǐ de jiārén dōu hǎo ma?"),
            "ru": ("Как поживает твоя семья?", "Kak pa-zhee-VA-yet tva-YA syem-YA?"),
            "pt": ("Como está a sua família?", "KOH-moo ess-TAH ah SOO-ah fah-MEE-lee-ah"),
            "hi": ("आपका परिवार कैसा है?", "Aapka parivaar kaisa hai?"),
            "ar": ("كيف حال عائلتك؟", "Kayfa halu a'ilatik?"),
            "tr": ("Ailen nasıl, iyiler mi?", "eye-LEN nah-suhl ee-yee-LER mee"),
            "nl": ("Hoe gaat het met je familie?", "hoo khaht het met yuh fah-MEE-lee"),
            "id": ("Bagaimana kabar keluargamu?", "bah-guy-MAH-nah KAH-bahr keh-loo-AHR-gah-moo"),
            "th": ("ครอบครัวของคุณสบายดีไหม?", "Khrop khrua khong khun sabaidee mai?"),
            "vi": ("Gia đình bạn dạo này thế nào?", "Zyah deen ban zhow nay teh now?"),
            "tl": ("Kamusta ang iyong pamilya?", "kah-MOOS-tah ahng ee-YOHNG pah-MEEL-yah")
        },
        "health": {
            "en": ("How is your health these days?", "how is yer helth theez dayz"),
            "es": ("¿Cómo está tu salud estos días?", "KOH-moh ess-TAH too sah-LOOD ESS-tohs DEE-ahs"),
            "fr": ("Comment va ta santé ces temps-ci?", "koh-mahn vah tah sahn-TAY say tahn-SEE"),
            "de": ("Wie steht es um deine Gesundheit?", "vee shtayt es oom DY-nuh geh-ZOONT-hite"),
            "it": ("Come va la tua salute ultimamente?", "KOH-may vah lah TOO-ah sah-LOO-tay ool-tee-mah-MEN-tay"),
            "ja": ("最近、体調はいかがですか？", "Saikin, taichou wa ikaga desu ka?"),
            "ko": ("요즘 건강은 어떠세요?", "Yojeum geongangeun eotteoseyo?"),
            "zh": ("你最近身体好吗？", "Nǐ zuìjìn shēntǐ hǎo ma?"),
            "ru": ("Как твоё здоровье в последнее время?", "Kak tva-YO zda-ROV-ye v pas-LED-nye-ye VRYE-mya?"),
            "pt": ("Como está sua saúde ultimamente?", "KOH-moo ess-TAH soo-ah sah-OO-jee ool-tchee-mah-MEN-tchee"),
            "hi": ("इन दिनों आपकी सेहत कैसी है?", "In dino aapki sehat kaisi hai?"),
            "ar": ("كيف هي صحتك هذه الأيام؟", "Kayfa hiya sihatuka hadhihi al-ayyam?"),
            "tr": ("Bu aralar sağlığın nasıl?", "boo ah-rah-LAHR sah-luh-UHN nah-suhl"),
            "nl": ("Hoe is het met je gezondheid?", "hoo is het met yuh khuh-ZONT-hite"),
            "id": ("Bagaimana kesehatanmu akhir-akhir ini?", "bah-guy-MAH-nah keh-seh-HAH-tahn-moo ah-keer ah-keer EE-nee"),
            "th": ("ช่วงนี้สุขภาพเป็นอย่างไรบ้าง?", "Chuang nee suk-kha-phaap pen yang rai baang?"),
            "vi": ("Dạo này sức khỏe của bạn thế nào?", "Zhow nay sook khweh koo-ah ban teh now?"),
            "tl": ("Kamusta ang iyong kalusugan ngayon?", "kah-MOOS-tah ahng ee-YOHNG kah-loo-SOO-gahn ngah-YOHN")
        },
        "work": {
            "en": ("How is work treating you?", "how is werk treet-ing yoo"),
            "es": ("¿Qué tal va el trabajo?", "keh tahl vah el trah-BAH-hoh"),
            "fr": ("Comment se passe le boulot?", "koh-mahn suh pahss luh boo-LOH"),
            "de": ("Wie läuft es auf der Arbeit?", "vee loyft es owf dair AHR-bite"),
            "it": ("Come procede il lavoro?", "KOH-may proh-CHEH-day eel lah-VOH-roh"),
            "ja": ("仕事の調子はどうですか？", "Shigoto no choushi wa dou desu ka?"),
            "ko": ("일은 잘 되어가나요?", "Ireun jal doeeoganayo?"),
            "zh": ("工作进行得顺利吗？", "Gōngzuò jìnxíng de shùnlì ma?"),
            "ru": ("Как продвигается работа?", "Kak prad-vee-GA-yet-sya ra-BO-ta?"),
            "pt": ("Como estão as coisas no trabalho?", "KOH-moo ess-TOWN ahs KOY-zahs noo trah-BAHL-yoo"),
            "hi": ("काम कैसा चल रहा है?", "Kaam kaisa chal raha hai?"),
            "ar": ("كيف تسير الأمور في العمل؟", "Kayfa taseeru al-umooru fee al-amal?"),
            "tr": ("İşler nasıl gidiyor?", "eesh-LER nah-suhl gee-dee-YOR"),
            "nl": ("Hoe gaat het op het werk?", "hoo khaht het op het vehrk"),
            "id": ("Bagaimana pekerjaanmu berjalan?", "bah-guy-MAH-nah peh-kehr-JAH-ahn-moo behr-JAH-lahn"),
            "th": ("งานเป็นอย่างไรบ้างช่วงนี้?", "Ngaan pen yang rai baang chuang nee?"),
            "vi": ("Công việc của bạn dạo này thế nào?", "Kong vyek koo-ah ban zhow nay teh now?"),
            "tl": ("Kamusta ang trabaho mo?", "kah-MOOS-tah ahng trah-BAH-hoh moh")
        },
        "studies": {
            "en": ("How are your studies going?", "how ar yer stud-eez goh-ing"),
            "es": ("¿Cómo van tus estudios?", "KOH-moh vahn toos ess-TOO-dee-ohs"),
            "fr": ("Comment se passent tes études?", "koh-mahn suh pahss tay zay-TOOD"),
            "de": ("Wie läuft das Studium / die Schule?", "vee loyft dahs SHTOO-dee-oom"),
            "it": ("Come vanno i tuoi studi?", "KOH-may VAHN-noh ee TWAY STOO-dee"),
            "ja": ("勉強の進み具合はどう？", "Benkyou no susumiguai wa dou?"),
            "ko": ("공부는 잘 되어가나요?", "Gongbuneun jal doeeoganayo?"),
            "zh": ("学业进展如何？", "Xuéyè jìnzhǎn rúhé?"),
            "ru": ("Как твоя учёба?", "Kak tva-YA oo-CHO-ba?"),
            "pt": ("Como vão os seus estudos?", "KOH-moo vown oos seh-oos ess-TOO-doos"),
            "hi": ("आपकी पढ़ाई कैसी चल रही है?", "Aapki padhai kaisi chal rahi hai?"),
            "ar": ("كيف تسير دراستك؟", "Kayfa taseeru dirasatuk?"),
            "tr": ("Derslerin / eğitimin nasıl gidiyor?", "dehrs-leh-REEN nah-suhl gee-dee-YOR"),
            "nl": ("Hoe gaat het met je studie?", "hoo khaht het met yuh STOO-dee"),
            "id": ("Bagaimana dengan kuliah / sekolahmu?", "bah-guy-MAH-nah deng-AHN koo-LEE-ah-moo"),
            "th": ("การเรียนเป็นอย่างไรบ้าง?", "Kaan rian pen yang rai baang?"),
            "vi": ("Việc học của bạn thế nào rồi?", "Vyek hawk koo-ah ban teh now roy?"),
            "tl": ("Kamusta ang iyong pag-aaral?", "kah-MOOS-tah ahng ee-YOHNG pahg-AH-ah-rahl")
        }
    })
]

def get_concepts():
    items = list(CONCEPTS)
    # expand systematic variations to reach 85 items
    slots = [
        ("weekend", "Have a wonderful weekend ahead!", "🎉", "¡Buen fin de semana!", "Bon week-end!", "Schönes Wochenende!", "Buon fine settimana!", "良い週末を！", "좋은 주말 보내세요!", "周末愉快！", "Хороших выходных!", "Bom fim de semana!", "सप्ताहांत शुभ हो!", "عطلة نهاية أسبوع سعيدة!", "İyi hafta sonları!", "Fijn weekend!", "Selamat berakhir pekan!", "ขอให้มีวันหยุดสุดสัปดาห์ที่ดี!", "Cuối tuần vui vẻ!", "Magandang katapusan ng linggo!"),
        ("trip", "Have a safe and pleasant journey!", "✈️", "¡Buen viaje!", "Bon voyage!", "Gute Reise!", "Buon viaggio!", "良い旅を！", "안전한 여행 되세요!", "旅途愉快！", "Счастливого пути!", "Boa viagem!", "शुभ यात्रा!", "رحلة سعيدة وآمنة!", "İyi yolculuklar!", "Goede reis!", "Semoga perjalanan aman!", "เดินทางปลอดภัยนะ!", "Thượng lộ bình an!", "Ligtas na paglalakbay!"),
        ("morning", "Hope your morning is off to a great start!", "🌅", "¡Que tengas una linda mañana!", "Passe une belle matinée!", "Guten Morgen und einen guten Start!", "Buona mattinata!", "素敵な朝を！", "상쾌한 아침 시작하세요!", "愿你有个美好的早晨！", "Отличного начала утра!", "Tenha uma linda manhã!", "आपकी सुबह शानदार हो!", "صباح جميل ومشرق!", "Güne harika bir başlangıç dilerim!", "Fijne ochtend!", "Semoga pagimu menyenangkan!", "ขอให้เช้าวันนี้สดใสนะ!", "Chúc buổi sáng tuyệt vời!", "Magandang simula ng umaga!"),
        ("pleasure", "It is an absolute honor and pleasure!", "🤝", "Es un gran honor y placer", "C'est un réel plaisir et honneur", "Es ist mir eine Ehre und Freude", "È un grande onore e piacere", "光栄でとても嬉しいです", "만나 뵙게 되어 큰 영광입니다", "非常荣幸与高兴", "Это огромная честь и удовольствие", "É uma honra e prazer absoluto", "यह मेरे लिए सम्मान की बात है", "شرف وسرور كبير لي", "Büyük bir onur ve zevk", "Het is een grote eer en genoegen", "Merupakan kehormatan dan kebahagiaan", "เป็นเกียรติและยินดีอย่างยิ่ง", "Thật là vinh hạnh và vui mừng", "Isang malaking karangalan at kagalakan!"),
        ("appreciation", "I truly appreciate your time and help!", "🙏", "Aprecio mucho tu tiempo y ayuda", "J'apprécie vraiment ton aide et ton temps", "Ich schätze deine Zeit und Hilfe sehr", "Apprezzo molto il tuo tempo e aiuto", "お時間とお力添えに感謝します", "시간과 도움에 진심으로 감사드려요", "非常感谢您的宝贵时间与帮助", "Очень ценю твою помощь и время", "Agradeço muito seu tempo e ajuda", "मैं आपके समय और मदद की कद्र करता हूँ", "أقدر حقاً وقتك ومساعدتك", "Zamanın ve yardımın için minnettarım", "Ik waardeer je tijd en hulp enorm", "Saya sangat menghargai waktu dan bantuanmu", "ขอบคุณสำหรับเวลาและความช่วยเหลือจริงๆ", "Tôi rất trân trọng thời gian và sự giúp đỡ của bạn", "Lubos kong pinapahalagahan ang iyong oras at tulong!"),
        ("see_tomorrow", "See you tomorrow morning, take care!", "👋", "¡Nos vemos mañana por la mañana, cuídate!", "À demain matin, prends soin de toi!", "Bis morgen früh, mach's gut!", "Ci vediamo domattina, riguardati!", "明日の朝またね、気をつけて！", "내일 아침에 봐요, 잘 지내요!", "明早见，多保重！", "До завтрашнего утра, береги себя!", "Até amanhã de manhã, cuide-se!", "कल सुबह मिलते हैं, अपना ख्याल रखना!", "أراك صباح الغد، اعتنِ بنفسك!", "Yarın sabah görüşürüz, kendine iyi bak!", "Tot morgenochtend, doe rustig aan!", "Sampai jumpa besok pagi, jaga diri!", "เจอกันพรุ่งนี้เช้านะ ดูแลตัวเองด้วย!", "Hẹn gặp lại vào sáng mai, bảo trọng!", "Kita-kits bukas ng umaga, mag-ingat ka!")
    ]

    for idx, s in enumerate(slots):
        items.append({
            "id": f"greet_extra_{idx}_{s[0]}",
            "english": s[1],
            "emoji": s[2],
            "translations": {
                "en": (s[1], s[1].lower()),
                "es": (s[3], s[3].lower()),
                "fr": (s[4], s[4].lower()),
                "de": (s[5], s[5].lower()),
                "it": (s[6], s[6].lower()),
                "ja": (s[7], s[7]),
                "ko": (s[8], s[8]),
                "zh": (s[9], s[9]),
                "ru": (s[10], s[10].lower()),
                "pt": (s[11], s[11].lower()),
                "hi": (s[12], s[12]),
                "ar": (s[13], s[13]),
                "tr": (s[14], s[14].lower()),
                "nl": (s[15], s[15].lower()),
                "id": (s[16], s[16].lower()),
                "th": (s[17], s[17]),
                "vi": (s[18], s[18]),
                "tl": (s[19], s[19].lower())
            }
        })
    return items

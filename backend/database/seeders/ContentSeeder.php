<?php

namespace Database\Seeders;

use App\Models\Achievement;
use App\Models\Activity;
use App\Models\Category;
use App\Models\Document;
use App\Models\Event;
use App\Models\GalleryAlbum;
use App\Models\Member;
use App\Models\NavigationItem;
use App\Models\Page;
use App\Models\Post;
use App\Models\Video;
use App\Models\WebsiteSetting;
use Database\Seeders\Support\SampleMedia;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class ContentSeeder extends Seeder
{
    protected array $categories = [];

    public function run(): void
    {
        SampleMedia::generate();

        $this->seedSettings();
        $this->seedNavigation();
        $this->seedPages();
        $this->seedCategories();
        $this->seedPosts();
        $this->seedActivities();
        $this->seedEvents();
        $this->seedGallery();
        $this->seedVideos();
        $this->seedDocuments();
        $this->seedMembers();
        $this->seedAchievements();
    }

    protected function seedSettings(): void
    {
        $settings = [
            ['site_name', 'Mon Literature and Culture Association', 'general', 'text', 'Website Name'],
            ['site_short_name', 'MLCA', 'general', 'text', 'Short Name'],
            ['site_tagline', 'Preserving Our Heritage, Inspiring the Future', 'general', 'text', 'Tagline'],
            ['site_description', 'The official website of the Mon Literature and Culture Association at the University of Computer Studies, Hpa-An.', 'general', 'textarea', 'Site Description'],
            ['university_name', 'University of Computer Studies - Hpa-An', 'general', 'text', 'University Name'],
            ['established_year', '2015', 'general', 'text', 'Established Year'],
            ['site_logo', 'uploads/seed/logo.svg', 'appearance', 'image', 'Website Logo'],
            ['footer_logo', 'uploads/seed/logo.svg', 'appearance', 'image', 'Footer Logo'],
            ['favicon', 'uploads/seed/favicon.png', 'appearance', 'image', 'Favicon'],
            ['hero_image', 'uploads/seed/hero.jpg', 'homepage', 'image', 'Hero Background'],
            ['hero_title', 'Mon Literature and Culture Association', 'homepage', 'text', 'Hero Title'],
            ['hero_subtitle', 'University of Computer Studies - Hpa-An', 'homepage', 'text', 'Hero Subtitle'],
            ['hero_description', 'Celebrating Mon heritage, language and culture while empowering the next generation of Mon students.', 'homepage', 'textarea', 'Hero Description'],
            ['hero_cta_label', 'Explore Our Activities', 'homepage', 'text', 'Hero Button Label'],
            ['hero_cta_url', '/activities', 'homepage', 'text', 'Hero Button URL'],
            ['about_image', 'uploads/seed/about.jpg', 'homepage', 'image', 'About Image'],
            ['about_excerpt', 'We are a student-led association dedicated to preserving and promoting Mon literature, language and culture within the university community and beyond.', 'homepage', 'textarea', 'About Summary'],
            ['home_about_title', 'Rooted in Heritage, Growing Together', 'homepage', 'text', 'About Section Title'],
            ['footer_about', 'The Mon Literature and Culture Association at UCS Hpa-An brings together students who share a love for Mon language, literature and traditions.', 'footer', 'textarea', 'Footer About'],
            ['copyright', 'Mon Literature and Culture Association. All rights reserved.', 'footer', 'text', 'Copyright'],
            ['email', 'mlcaucshpaan2018@gmail.com', 'contact', 'text', 'Email Address'],
            ['phone', '09780865174', 'contact', 'text', 'Phone'],
            ['address', 'University of Computer Studies, Hpa-An, Kayin State, Myanmar', 'contact', 'textarea', 'Address'],
            ['office_hours', 'Monday - Friday, 9:00 AM - 4:00 PM', 'contact', 'text', 'Office Hours'],
            ['facebook_url', 'https://facebook.com/mlca.ucshpaan', 'social', 'url', 'Facebook'],
            ['youtube_url', 'https://youtube.com/@mlca', 'social', 'url', 'YouTube'],
            ['telegram_url', 'https://t.me/mlca', 'social', 'url', 'Telegram'],
            ['instagram_url', 'https://instagram.com/mlca', 'social', 'url', 'Instagram'],
            ['tiktok_url', 'https://tiktok.com/@mlca', 'social', 'url', 'TikTok'],
            ['google_map_embed', 'https://www.google.com/maps?q=University+of+Computer+Studies+Hpa-An&output=embed', 'contact', 'text', 'Google Map Embed URL'],
        ];

        foreach ($settings as [$key, $value, $group, $type, $label]) {
            WebsiteSetting::updateOrCreate(['key' => $key], compact('value', 'group', 'type', 'label'));
        }
    }

    protected function seedNavigation(): void
    {
        $header = [
            ['Home', 'ပင်မ', 'မုက်လိက်', '/'],
            ['About Us', 'ကျွန်ုပ်တို့အကြောင်း', 'ပရောဟ်ပိုဲ', '/about'],
            ['News & Announcements', 'သတင်းနှင့်ကြေညာချက်များ', 'ပရိုင်ကဵုသမ္မတ', '/news'],
            ['Activities', 'လှုပ်ရှားမှုများ', 'ကမၠောန်ဂမၠိုင်', '/activities'],
            ['Events', 'ပွဲများ', 'သဘင်ဂမၠိုင်', '/events'],
            ['Gallery', 'ဓာတ်ပုံများ', 'ဗီုရုပ်', '/gallery'],
            ['Videos', 'ဗီဒီယိုများ', 'ဗီဒဳယော', '/videos'],
            ['Documents', 'စာရွက်စာတမ်းများ', 'လိက်တၟအ်', '/documents'],
            ['Our Members', 'ကျွန်ုပ်တို့၏အဖွဲ့ဝင်များ', 'ကောန်ဂကောံပိုဲ', '/members'],
            ['Contact Us', 'ဆက်သွယ်ရန်', 'စၟဳစၟတ်ပိုဲ', '/contact'],
        ];

        foreach ($header as $i => [$en, $my, $mnw, $url]) {
            NavigationItem::updateOrCreate(
                ['url' => $url, 'location' => 'header', 'parent_id' => null],
                ['label_en' => $en, 'label_my' => $my, 'label_mnw' => $mnw, 'order' => $i, 'is_visible' => true, 'target' => '_self']
            );
        }

        $footer = [
            ['About Us', 'ကျွန်ုပ်တို့အကြောင်း', 'ပရောဟ်ပိုဲ', '/about'],
            ['News', 'သတင်း', 'ပရိုင်', '/news'],
            ['Activities', 'လှုပ်ရှားမှုများ', 'ကမၠောန်ဂမၠိုင်', '/activities'],
            ['Gallery', 'ဓာတ်ပုံများ', 'ဗီုရုပ်', '/gallery'],
            ['Documents', 'စာရွက်စာတမ်းများ', 'လိက်တၟအ်', '/documents'],
            ['Contact Us', 'ဆက်သွယ်ရန်', 'စၟဳစၟတ်ပိုဲ', '/contact'],
        ];

        foreach ($footer as $i => [$en, $my, $mnw, $url]) {
            NavigationItem::updateOrCreate(
                ['url' => $url, 'location' => 'footer', 'parent_id' => null],
                ['label_en' => $en, 'label_my' => $my, 'label_mnw' => $mnw, 'order' => $i, 'is_visible' => true, 'target' => '_self']
            );
        }
    }

    protected function seedPages(): void
    {
        $about = Page::updateOrCreate(['slug' => 'about'], ['is_published' => true]);

        $aboutTranslations = [
            'en' => [
                'title' => 'About Us',
                'excerpt' => 'Learn about the history, vision, mission and people behind the Mon Literature and Culture Association.',
                'content' => '<p>The Mon Literature and Culture Association (MLCA) of the University of Computer Studies - Hpa-An is a student-led organization established to preserve, promote and celebrate Mon literature, language and culture.</p><p>Our association brings together Mon students and friends of Mon culture to learn from one another, organize cultural events, share knowledge and serve the community.</p>',
                'history' => '<p>MLCA was founded by a group of passionate Mon students who wanted to create a welcoming space for cultural exchange on campus. Since its establishment, the association has grown into a vibrant community that organizes cultural festivals, literature talks, traditional dance and music performances, community service projects and student exchange programs.</p><p>Over the years, MLCA has partnered with senior community leaders, monks, writers and artists to pass on Mon heritage to younger generations.</p>',
                'vision' => 'A united and proud Mon community that preserves its language, literature and culture while embracing education and modern technology.',
                'mission' => 'To promote Mon literature and culture, strengthen cultural identity, support students and serve the community through meaningful programs and partnerships.',
                'objectives' => '<ul><li>Preserve and promote Mon language, literature, script and traditional arts.</li><li>Organize cultural events, workshops, competitions and exhibitions.</li><li>Build a supportive network among Mon students and the wider community.</li><li>Encourage academic excellence and leadership among members.</li><li>Document and share Mon cultural heritage for future generations.</li></ul>',
            ],
            'my' => [
                'title' => 'ကျွန်ုပ်တို့အကြောင်း',
                'excerpt' => 'မွန်စာပေနှင့်ယဉ်ကျေးမှုအသင်း၏ သမိုင်း၊ မျှော်မှန်းချက်၊ ရည်မှန်းချက်နှင့် လူပုဂ္ဂိုလ်များအကြောင်း လေ့လာပါ။',
                'content' => '<p>ကွန်ပျူတာတက္ကသိုလ် (ဘားအံ)၏ မွန်စာပေနှင့်ယဉ်ကျေးမှုအသင်း (MLCA) သည် မွန်စာပေ၊ ဘာသာစကားနှင့် ယဉ်ကျေးမှုကို ထိန်းသိမ်းကာကွယ်၊ မြှင့်တင်ရန် ဖွဲ့စည်းထားသော ကျောင်းသားဦးဆောင်အဖွဲ့အစည်းဖြစ်သည်။</p><p>ကျွန်ုပ်တို့အသင်းသည် မွန်ကျောင်းသားများနှင့် မွန်ယဉ်ကျေးမှုကို ချစ်မြတ်နိုးသူများကို စုစည်းပြီး အပြန်အလှန်လေ့လာခြင်း၊ ယဉ်ကျေးမှုပွဲများ ကျင်းပခြင်းနှင့် လူမှုရေးဆောင်ရွက်ချက်များဖြင့် ဝိုင်းဝန်းကူညီဆောင်ရွက်လျက်ရှိသည်။</p>',
                'history' => '<p>MLCA ကို မွန်ယဉ်ကျေးမှုကို ချစ်မြတ်နိုးသော ကျောင်းသားအုပ်စုတစ်စုက ကျောင်းဝင်းအတွင်း ယဉ်ကျေးမှုဖလှယ်နိုင်သည့် နေရာတစ်ခု ဖန်တီးရန် စတင်တည်ထောင်ခဲ့သည်။ ယနေ့အထိ ယဉ်ကျေးမှုပွဲတော်များ၊ စာပေဟောပြောပွဲများ၊ ရိုးရာအကနှင့်ဂီတဖျော်ဖြေပွဲများ၊ လူမှုရေးလုပ်ငန်းများ စသည်ဖြင့် တိုးတက်လာခဲ့သည်။</p>',
                'vision' => 'ဘာသာစကား၊ စာပေနှင့် ယဉ်ကျေးမှုကို ထိန်းသိမ်းစောင့်ရှောက်ရင်း ပညာရေးနှင့် ခေတ်မီနည်းပညာကို လက်တွဲသွားမည့် စည်းလုံးညီညွတ်ပြီး ဂုဏ်ယူဖွယ် မွန်အသိုက်အဝန်း။',
                'mission' => 'မွန်စာပေနှင့်ယဉ်ကျေးမှုကို မြှင့်တင်ခြင်း၊ ယဉ်ကျေးမှုအမှတ်အသားကို ခိုင်မာစေခြင်း၊ ကျောင်းသားများကို ပံ့ပိုးကူညီခြင်းနှင့် အဓိပ္ပာယ်ရှိသော လုပ်ငန်းစဉ်များဖြင့် လူမှုအသိုင်းအဝိုင်းကို ဝန်ဆောင်မှုပေးခြင်း။',
                'objectives' => '<ul><li>မွန်ဘာသာစကား၊ စာပေ၊ စာလုံးပုံစံနှင့် ရိုးရာအနုပညာများကို ထိန်းသိမ်းမြှင့်တင်ရန်။</li><li>ယဉ်ကျေးမှုပွဲများ၊ အလုပ်ရုံများ၊ ပြိုင်ပွဲများနှင့် ပြပွဲများ ကျင်းပရန်။</li><li>မွန်ကျောင်းသားများနှင့် လူမှုအသိုင်းအဝိုင်းအကြား ကူညီပံ့ပိုးမှုကွန်ရက် တည်ဆောက်ရန်။</li><li>အဖွဲ့ဝင်များ၏ ပညာရေးထူးချွန်မှုနှင့် ခေါင်းဆောင်မှုကို အားပေးရန်။</li><li>မွန်ယဉ်ကျေးမှုအမွေအနှစ်များကို မှတ်တမ်းတင်ပြီး မျိုးဆက်သစ်များထံ မျှဝေရန်။</li></ul>',
            ],
            'mnw' => [
                'title' => 'ပရောဟ်ပိုဲ',
                'excerpt' => 'ဝင်ကၠောန်ဂကောံ လိက်ပတ်ယဥ်ကျေးမှုမန် - သဟာဲ၊ ပတှ်ေကေတ်၊ တင်တုပ်စိုတ် ကေုာံ မၞိဟ်ဂမၠိုင်။',
                'content' => '<p>ဂကောံလိက်ပတ်ယဥ်ကျေးမှုမန် (MLCA) ပ္ဍဲတက္ကသိုလ်ကောန်ပျူတာ (ဘားအံ) ဂှ် ဒှ်ဂကောံကွးဘာတအ် မဖန်ဗဒှ်လဝ် သွက်ဂွံမင်မဲ ဒယှ်ေဒွက်၊ ဘာသာမန် ကေုာံ ယဥ်ကျေးမှုမန်တအ်ရ။</p><p>ဂကောံပိုဲ ပံင်ကောံ ကွးဘာမန်တအ် ကေုာံ မၞိဟ်မဆာန်ယဥ်ကျေးမှုမန်တအ် သွက်ဂွံဗတောန်ရေင်သကအ်၊ ကၠောန်သဘင်ယဥ်ကျေးမှု ကေုာံ ရီုဗင်ကောန်ဂကူရ။</p>',
                'history' => '<p>MLCA ဂှ် ကွးဘာမန်တအ် မဆာန်ယဥ်ကျေးမှုမန် မွဲဂကောံ ဒက်ပ္တန်လဝ် သွက်ဂွံဖန်ဗဒှ် ဌာန်ပံင်ကောံ ယဥ်ကျေးမှု ပ္ဍဲကဵုတက္ကသိုလ်ရ။ စနူတေံတုဲ ဂကောံပိုဲ ဇၞော်မောဝ်တိုန် နကဵုသဘင်ယဥ်ကျေးမှု၊ ဟောပြောပွဲလိက်ပတ်၊ အကရိုးရာ ကေုာံ လုပ်ရပ်ရီုဗင်ကောန်ဂကူရ။</p>',
                'vision' => 'ဂကောံမန် မပံင်ကောံ မဂွံဂုဏ်ယာန် မင်မဲဘာသာ၊ လိက်ပတ် ကေုာံ ယဥ်ကျေးမှု ကေုာံ မဒုင်ကေတ်လဝ် ပညာ နကဵုနဲပညာခေတ်တၟိရ။',
                'mission' => 'သွက်ဂွံဒုင်တဲ လိက်ပတ်ယဥ်ကျေးမှုမန်၊ သွက်ဂွံခိုင်ဗိုန်အညာမန်၊ သွက်ဂွံရီုဗင်ကွးဘာ ကေုာံ သွက်ဂွံဗိုင်ရီုကောန်ဂကူ နကဵုကမၠောန်မနွံအဓိပ္ပါယ်ရ။',
                'objectives' => '<ul><li>မင်မဲ ဘာသာမန်၊ လိက်ပတ်၊ လိက်မန် ကေုာံ အနုပညာရိုးရာ။</li><li>ကၠောန်သဘင်ယဥ်ကျေးမှု၊ ဗတောန်ကွတ်ပညာ ကေုာံ ပြိုင်ပွဲ။</li><li>ဒက်ပ္တန်ကွန်ရက် ကြက်ရီုဗင် အကြာကွးဘာမန် ကေုာံ ကောန်ဂကူ။</li><li>ကဵုအခေါင်ကွးဘာ သွက်ပညာထတ်တ် ကေုာံ ခေါင်းဆောင်။</li><li>မှတ်တမ်းတင် ယဥ်ကျေးမှုမန် သွက်မျိုးဆက်တၟိ။</li></ul>',
            ],
        ];

        foreach ($aboutTranslations as $locale => $data) {
            $about->translations()->updateOrCreate(['locale' => $locale], $data);
        }

        $contact = Page::updateOrCreate(['slug' => 'contact'], ['is_published' => true]);
        $contactTranslations = [
            'en' => [
                'title' => 'Contact Us',
                'excerpt' => 'Get in touch with the Mon Literature and Culture Association.',
                'content' => '<p>We would love to hear from you. Whether you are a student, a community member, a partner organization or a friend of Mon culture, feel free to reach out to us using the form or the contact details below.</p>',
            ],
            'my' => [
                'title' => 'ဆက်သွယ်ရန်',
                'excerpt' => 'မွန်စာပေနှင့်ယဉ်ကျေးမှုအသင်းနှင့် ဆက်သွယ်ပါ။',
                'content' => '<p>ကျွန်ုပ်တို့ထံ ဆက်သွယ်လိုပါက အောက်ပါဖောင် သို့မဟုတ် ဆက်သွယ်ရန်အချက်အလက်များကို အသုံးပြုနိုင်ပါသည်။</p>',
            ],
            'mnw' => [
                'title' => 'စၟဳစၟတ်ပိုဲ',
                'excerpt' => 'စၟဳစၟတ် ဂကောံလိက်ပတ်ယဥ်ကျေးမှုမန်။',
                'content' => '<p>ပိုဲမိက်ဂွံကလိဂွံ ပရိုင် နူညးမဆာန်ယဥ်ကျေးမှုမန်တအ်ရ။ စၟဳစၟတ်ပိုဲ နကဵု ဖောမ် ဟွံသေင်မ္ဂး နကဵုအရာမစၟတ်သမ္တီ သၟဝ်ဏအ်ရ။</p>',
            ],
        ];

        foreach ($contactTranslations as $locale => $data) {
            $contact->translations()->updateOrCreate(['locale' => $locale], $data);
        }
    }

    protected function seedCategories(): void
    {
        $categories = [
            ['Announcements', 'ကြေညာချက်များ', 'ပရိုင်ကဵုသမ္မတ', 'announcements', 'announcement'],
            ['News', 'သတင်းများ', 'ပရိုင်ဂမၠိုင်', 'news', 'post'],
            ['Cultural News', 'ယဉ်ကျေးမှုသတင်း', 'ပရိုင်ယဥ်ကျေးမှု', 'cultural-news', 'post'],
            ['Student Life', 'ကျောင်းသားဘဝ', 'ဘဝကွးဘာ', 'student-life', 'post'],
            ['Cultural Activities', 'ယဉ်ကျေးမှုလှုပ်ရှားမှုများ', 'ကမၠောန်ယဥ်ကျေးမှု', 'cultural-activities', 'activity'],
            ['Academic Activities', 'ပညာရေးလှုပ်ရှားမှုများ', 'ကမၠောန်ပညာ', 'academic-activities', 'activity'],
            ['Community Service', 'လူမှုရေးလုပ်ငန်းများ', 'ကမၠောန်ရီုဗင်ကောန်ဂကူ', 'community-service', 'activity'],
            ['Cultural Events', 'ယဉ်ကျေးမှုပွဲများ', 'သဘင်ယဥ်ကျေးမှု', 'cultural-events', 'event'],
            ['University Events', 'တက္ကသိုလ်ပွဲများ', 'သဘင်တက္ကသိုလ်', 'university-events', 'event'],
            ['Ceremonies', 'အခမ်းအနားများ', 'သဘင်ဂမၠိုင်', 'ceremonies', 'event'],
            ['Cultural Festivals', 'ယဉ်ကျေးမှုပွဲတော်များ', 'သဘင်ယဥ်ကျေးမှု', 'cultural-festivals', 'gallery'],
            ['Campus Life', 'ကျောင်းဝင်းဘဝ', 'ဘဝပ္ဍဲတက္ကသိုလ်', 'campus-life', 'gallery'],
            ['Traditional Dance', 'ရိုးရာအက', 'အကရိုးရာ', 'traditional-dance', 'gallery'],
            ['Documentaries', 'မှတ်တမ်းရုပ်ရှင်', 'ဗီဒဳယောမှတ်တမ်း', 'documentaries', 'video'],
            ['Performances', 'ဖျော်ဖြေပွဲများ', 'ပွဲဖျော်ဖြေ', 'performances', 'video'],
            ['Lectures', 'ဟောပြောပွဲများ', 'ဟောပြောပွဲ', 'lectures', 'video'],
            ['Reports', 'အစီရင်ခံစာများ', 'ရေဒါင်စာ', 'reports', 'document'],
            ['Policies', 'မူဝါဒများ', 'ဗျူဟာ', 'policies', 'document'],
            ['Cultural Documents', 'ယဉ်ကျေးမှုစာတမ်းများ', 'လိက်တၟအ်ယဥ်ကျေးမှု', 'cultural-documents', 'document'],
        ];

        foreach ($categories as $i => [$name, $my, $mnw, $slug, $type]) {
            $this->categories[$slug] = Category::updateOrCreate(
                ['slug' => $slug],
                ['name' => $name, 'name_my' => $my, 'name_mnw' => $mnw, 'type' => $type, 'order' => $i, 'is_active' => true]
            );
        }
    }

    protected function attachMedia($model, array $paths, string $collection = 'gallery'): void
    {
        foreach ($paths as $index => $path) {
            $model->media()->create([
                'collection' => $collection,
                'type' => str_ends_with($path, '.pdf') ? 'document' : 'image',
                'file_path' => $path,
                'file_name' => basename($path),
                'original_name' => basename($path),
                'mime_type' => str_ends_with($path, '.pdf') ? 'application/pdf' : 'image/jpeg',
                'size' => Storage::disk('public')->exists($path) ? Storage::disk('public')->size($path) : 0,
                'order' => $index,
            ]);
        }
    }

    protected function seedPosts(): void
    {
        $posts = [
            [
                'category' => 'announcements',
                'cover' => 'uploads/seed/post1.jpg',
                'featured' => true,
                'days' => 2,
                'media' => ['uploads/seed/gallery1.jpg', 'uploads/seed/gallery2.jpg', 'uploads/seed/gallery3.jpg'],
                'en' => [
                    'title' => 'Mon National Day Celebration 2026',
                    'slug' => 'mon-national-day-celebration-2026',
                    'excerpt' => 'Join us as we celebrate Mon National Day with traditional performances, literature exhibitions and community activities.',
                    'content' => '<p>We are delighted to invite all students, staff and friends of Mon culture to our Mon National Day Celebration 2026. The event will feature traditional Mon dance and music performances, a literature exhibition, cultural games and a community meal.</p><h2>Program Highlights</h2><ul><li>Traditional Mon dance and music performances</li><li>Mon literature and script exhibition</li><li>Student speech competition</li><li>Cultural photo booth and community lunch</li></ul><p>Everyone is welcome. Please bring your friends and family to celebrate our shared heritage together.</p>',
                ],
                'my' => [
                    'title' => '၂၀၂၆ မွန်အမျိုးသားနေ့ အခမ်းအနား',
                    'slug' => 'mon-national-day-celebration-2026-my',
                    'excerpt' => 'ရိုးရာအကများ၊ စာပေပြပွဲများနှင့် လူမှုရေးလှုပ်ရှားမှုများဖြင့် မွန်အမျိုးသားနေ့ကို ကျင်းပပါမည်။',
                    'content' => '<p>မွန်အမျိုးသားနေ့ အခမ်းအနားသို့ ကျောင်းသား၊ ဆရာ၊ မွန်ယဉ်ကျေးမှုကို ချစ်မြတ်နိုးသူအားလုံး ဖိတ်ခေါ်အပ်ပါသည်။ ရိုးရာအကနှင့်ဂီတဖျော်ဖြေပွဲများ၊ စာပေပြပွဲများ၊ ယဉ်ကျေးမှုကစားနည်းများနှင့် စုပေါင်းဧည့်ခံပွဲ ပါဝင်မည်ဖြစ်ပါသည်။</p><h2>အစီအစဉ်များ</h2><ul><li>ရိုးရာမွန်အက၊ ဂီတဖျော်ဖြေပွဲများ</li><li>မွန်စာပေနှင့် စာလုံးပြပွဲ</li><li>ကျောင်းသားမိန့်ခွန်းပြိုင်ပွဲ</li><li>ယဉ်ကျေးမှုဓာတ်ပုံနှင့် စုပေါင်းနေ့လယ်စာ</li></ul>',
                ],
                'mnw' => [
                    'title' => 'သဘင်တ္ၚဲကောန်ဂကူမန် ၂၀၂၆',
                    'slug' => 'mon-national-day-celebration-2026-mnw',
                    'excerpt' => 'ကၠုင်ပံင်ကောံ ပ္ဍဲသဘင်တ္ၚဲကောန်ဂကူမန် နကဵုအကရိုးရာ၊ ပြပွဲလိက်ပတ် ကေုာံ ကမၠောန်ကောန်ဂကူ။',
                    'content' => '<p>ပိုဲပၠုပ်စုတ်ဖိတ် ကွးဘာ၊ ကျာ် ကေုာံ ညးမဆာန်ယဥ်ကျေးမှုမန်တအ် ကၠုင်ပံင်ကောံ ပ္ဍဲသဘင်တ္ၚဲကောန်ဂကူမန် ၂၀၂၆ရ။ သဘင်ဏအ် နွံကဵု အကရိုးရာမန်၊ ဂီတ၊ ပြပွဲလိက်ပတ် ကေုာံ ပွဲစပ္ၚာန်ကောန်ဂကူရ။</p><h2>ကဏ္ဍဂမၠိုင်</h2><ul><li>အကရိုးရာ ကေုာံ ဂီတမန်</li><li>ပြပွဲလိက်ပတ်မန်</li><li>ပြိုင်ပွဲဟီုဂးကွးဘာ</li><li>ဓာတ်ပုံယဥ်ကျေးမှု ကေုာံ စပ္ၚာန်ပံင်ကောံ</li></ul>',
                ],
            ],
            [
                'category' => 'news',
                'cover' => 'uploads/seed/post2.jpg',
                'featured' => true,
                'days' => 5,
                'media' => ['uploads/seed/gallery4.jpg', 'uploads/seed/gallery5.jpg'],
                'en' => [
                    'title' => 'Traditional Mon Dance Workshop Successfully Completed',
                    'slug' => 'traditional-mon-dance-workshop-completed',
                    'excerpt' => 'More than 60 students joined our three-day traditional Mon dance workshop led by senior cultural teachers.',
                    'content' => '<p>Our three-day traditional Mon dance workshop came to a successful close last weekend. More than 60 students participated in the workshop, learning the basic movements, hand gestures and cultural meanings behind traditional Mon dance.</p><p>We thank our senior teachers and volunteers for sharing their knowledge and passion with the next generation. A special performance will be held at the upcoming Mon National Day celebration.</p>',
                ],
                'my' => [
                    'title' => 'မွန်ရိုးရာအက အလုပ်ရုံ အောင်မြင်စွာ ပြီးစီး',
                    'slug' => 'traditional-mon-dance-workshop-completed-my',
                    'excerpt' => 'သက်ကြီးယဉ်ကျေးမှုဆရာများ ဦးဆောင်သော သုံးရက်ကြာ မွန်ရိုးရာအက အလုပ်ရုံတွင် ကျောင်းသား ၆၀ ကျော် ပါဝင်ခဲ့သည်။',
                    'content' => '<p>သုံးရက်ကြာ မွန်ရိုးရာအက အလုပ်ရုံကို အောင်မြင်စွာ ပြီးဆုံးခဲ့ပါသည်။ ကျောင်းသား ၆၀ ကျော်သည် ရိုးရာအက၏ အခြေခံလှုပ်ရှားမှုများ၊ လက်ဟန်ခြေဟန်များနှင့် ယဉ်ကျေးမှုအဓိပ္ပာယ်များကို သင်ယူခဲ့ကြသည်။</p><p>အသိပညာနှင့် စိတ်အားထက်သန်မှုကို မျိုးဆက်သစ်များထံ မျှဝေပေးသော ဆရာကြီးများနှင့် စေတနာ့ဝန်ထမ်းများကို ကျေးဇူးတင်ရှိပါသည်။</p>',
                ],
                'mnw' => [
                    'title' => 'ဗတောန်ကွတ်အကရိုးရာမန် အာဲကၟာဲအတိုင်း တုဲဒှ်',
                    'slug' => 'traditional-mon-dance-workshop-completed-mnw',
                    'excerpt' => 'ကွးဘာ ၆၀ ပြင်ပြ ပါလုပ်လဝ် ပ္ဍဲဗတောန်ကွတ်အကရိုးရာမန် ပိတ္ၚဲ။',
                    'content' => '<p>ဗတောန်ကွတ်အကရိုးရာမန် ပိတ္ၚဲဂှ် တုဲဒှ်အာ နကဵုအံင်ဇၞးရ။ ကွးဘာ ၆၀ ပြင်ပြ ဂွံဗတောန် အခြေခံလှုပ်ရှားမှု၊ လက်ဟန်တအ် ကေုာံ အဓိပ္ပါယ်ယဥ်ကျေးမှုမန်ရ။</p>',
                ],
            ],
            [
                'category' => 'student-life',
                'cover' => 'uploads/seed/post3.jpg',
                'featured' => false,
                'days' => 9,
                'media' => ['uploads/seed/gallery6.jpg'],
                'en' => [
                    'title' => 'Welcoming Our New Members for the 2026 Academic Year',
                    'slug' => 'welcoming-new-members-2026',
                    'excerpt' => 'The association welcomed more than 80 new members with an orientation and cultural exchange program.',
                    'content' => '<p>The Mon Literature and Culture Association warmly welcomes more than 80 new members for the 2026 academic year. Our orientation program introduced the association mission, activities, committees and opportunities for students to get involved.</p><p>New members enjoyed ice-breaking games, a short cultural presentation and a traditional Mon snack fair. We look forward to a wonderful year together.</p>',
                ],
                'my' => [
                    'title' => '၂၀၂၆ ပညာသင်နှစ် အဖွဲ့ဝင်အသစ်များကို ကြိုဆိုခြင်း',
                    'slug' => 'welcoming-new-members-2026-my',
                    'excerpt' => 'အသင်းသည် အဖွဲ့ဝင်အသစ် ၈၀ ကျော်ကို မိတ်ဆက်ပွဲနှင့် ယဉ်ကျေးမှုဖလှယ်ပွဲဖြင့် ကြိုဆိုခဲ့သည်။',
                    'content' => '<p>၂၀၂၆ ပညာသင်နှစ်အတွက် အဖွဲ့ဝင်အသစ် ၈၀ ကျော်ကို မွန်စာပေနှင့်ယဉ်ကျေးမှုအသင်းမှ နွေးထွေးစွာ ကြိုဆိုပါသည်။ မိတ်ဆက်ပွဲတွင် အသင်း၏ ရည်မှန်းချက်၊ လှုပ်ရှားမှုများ၊ ကော်မတီများနှင့် ပါဝင်နိုင်သည့် အခွင့်အလမ်းများကို မိတ်ဆက်ပေးခဲ့သည်။</p>',
                ],
                'mnw' => [
                    'title' => 'ပံင်ကောံကောန်ဂကောံတၟိ သွက်သၞာံပညာ ၂၀၂၆',
                    'slug' => 'welcoming-new-members-2026-mnw',
                    'excerpt' => 'ဂကောံပိုဲ ပံင်ကောံကောန်ဂကောံတၟိ ၈၀ ပြင်ပြ နကဵုပွဲမိတ်ဆက် ကေုာံ ယဥ်ကျေးမှု။',
                    'content' => '<p>သွက်သၞာံပညာ ၂၀၂၆ ဂကောံပိုဲ ပံင်ကောံကောန်ဂကောံတၟိ ၈၀ ပြင်ပြ နကဵုစိုတ်ဂီုကၠီုရ။ ပွဲမိတ်ဆက်ဂှ် ပရောဟ်ဂကောံ၊ ကမၠောန် ကေုာံ အခေါင်ပါလုပ်ဂမၠိုင် ပါလုပ်လဝ်ရ။</p>',
                ],
            ],
            [
                'category' => 'cultural-news',
                'cover' => 'uploads/seed/post4.jpg',
                'featured' => true,
                'days' => 14,
                'media' => ['uploads/seed/gallery7.jpg', 'uploads/seed/gallery8.jpg'],
                'en' => [
                    'title' => 'Preserving the Mon Script: A Talk with Senior Writers',
                    'slug' => 'preserving-mon-script-talk',
                    'excerpt' => 'Senior Mon writers and teachers shared insights on the past, present and future of the Mon script.',
                    'content' => '<p>In partnership with local Mon literature groups, MLCA hosted an inspiring talk on preserving the Mon script. Senior writers discussed the history of the Mon alphabet, the importance of reading and writing in Mon, and the role of digital tools in keeping the language alive.</p><p>Students had the opportunity to ask questions and practice writing Mon characters. Recordings and reading materials will be made available in our document library.</p>',
                ],
                'my' => [
                    'title' => 'မွန်စာလုံးပုံစံ ထိန်းသိမ်းရေး- စာရေးဆရာကြီးများနှင့် ဆွေးနွေးပွဲ',
                    'slug' => 'preserving-mon-script-talk-my',
                    'excerpt' => 'မွန်စာရေးဆရာကြီးများနှင့် ဆရာများက မွန်စာလုံးပုံစံ၏ အတိတ်၊ ပစ္စုပ္ပန်နှင့် အနာဂတ်ကို မျှဝေခဲ့သည်။',
                    'content' => '<p>ဒေသခံမွန်စာပေအဖွဲ့များနှင့် ပူးပေါင်း၍ MLCA သည် မွန်စာလုံးပုံစံ ထိန်းသိမ်းရေးဆွေးနွေးပွဲကို ကျင်းပခဲ့သည်။ ဆွေးနွေးပွဲတွင် မွန်အက္ခရာသမိုင်း၊ မွန်စာဖတ်ရေးသားခြင်း၏ အရေးပါမှုနှင့် ဒစ်ဂျစ်တယ်နည်းပညာ၏ အခန်းကဏ္ဍကို ဆွေးနွေးခဲ့သည်။</p>',
                ],
                'mnw' => [
                    'title' => 'မင်မဲလိက်မန် - ဟီုဂးကေုာံညးချူလိက်ဇၞော်',
                    'slug' => 'preserving-mon-script-talk-mnw',
                    'excerpt' => 'ညးချူလိက်မန်ဇၞော်တအ် ပါ်ပရအ်လဝ် အတိတ်၊ ပစ္စုပ္ပန် ကေုာံ အနာဂတ်လိက်မန်။',
                    'content' => '<p>ပံင်ကောံကေုာံဂကောံလိက်ပတ်မန်ဒေသတအ်တုဲ MLCA ကၠောန်ဗဒှ်လဝ် ဟီုဂးမင်မဲလိက်မန်ရ။ ပါလုပ်လဝ် ပရောဟ်သမိုင်းအက္ခရာမန်၊ အရဏဖတ်ချူလိက်မန် ကေုာံ ကဏ္ဍနဲဒစ်ဂျစ်တယ်ရ။</p>',
                ],
            ],
            [
                'category' => 'announcements',
                'cover' => 'uploads/seed/activity4.jpg',
                'featured' => false,
                'days' => 20,
                'media' => [],
                'en' => [
                    'title' => 'Call for Volunteers: Community Service Program',
                    'slug' => 'call-for-volunteers-community-service',
                    'excerpt' => 'We are looking for student volunteers to join our upcoming community service program in Hpa-An.',
                    'content' => '<p>The association is inviting student volunteers to join our upcoming community service program. Volunteers will help with a community clean-up, donate school supplies and organize a small cultural activity for local children.</p><p>Interested students can register at the association office or contact the event coordinator. Transportation and meals will be provided.</p>',
                ],
                'my' => [
                    'title' => 'စေတနာ့ဝန်ထမ်းခေါ်ယူခြင်း- လူမှုရေးဝန်ဆောင်မှုအစီအစဉ်',
                    'slug' => 'call-for-volunteers-community-service-my',
                    'excerpt' => 'ဘားအံတွင် ကျင်းပမည့် လူမှုရေးဝန်ဆောင်မှုအစီအစဉ်အတွက် ကျောင်းသားစေတနာ့ဝန်ထမ်းများ ခေါ်ယူနေသည်။',
                    'content' => '<p>ကျွန်ုပ်တို့အသင်း၏ လူမှုရေးဝန်ဆောင်မှုအစီအစဉ်အတွက် ကျောင်းသားစေတနာ့ဝန်ထမ်းများ ခေါ်ယူနေပါသည်။ စေတနာ့ဝန်ထမ်းများသည် သန့်ရှင်းရေး၊ စာရေးကိရိယာလှူဒါန်းခြင်းနှင့် ကလေးများအတွက် ယဉ်ကျေးမှုလှုပ်ရှားမှုများ ပြုလုပ်နိုင်ပါသည်။</p>',
                ],
                'mnw' => [
                    'title' => 'ကော်နိမန်စေတနာ့ဝန်ထမ်း - ကမၠောန်ရီုဗင်ကောန်ဂကူ',
                    'slug' => 'call-for-volunteers-community-service-mnw',
                    'excerpt' => 'ကော်နိမန်ကွးဘာစေတနာ့ဝန်ထမ်း သွက်ကမၠောန်ရီုဗင်ကောန်ဂကူ ပ္ဍဲဘားအံ။',
                    'content' => '<p>ဂကောံပိုဲ ကော်နိမန်ကွးဘာစေတနာ့ဝန်ထမ်း သွက်ကမၠောန်ရီုဗင်ကောန်ဂကူရ။ စေတနာ့ဝန်ထမ်းတအ် ဗိုင်ရီုပ္ဍဲကမၠောန်သအးဇ္ၚး ကေုာံ ဒုင်ဒါန်ပညာ သွက်ကောန်ၚာ်ရ။</p>',
                ],
            ],
            [
                'category' => 'news',
                'cover' => 'uploads/seed/gallery2.jpg',
                'featured' => false,
                'days' => 28,
                'media' => ['uploads/seed/post2.jpg'],
                'en' => [
                    'title' => 'MLCA Members Win Prizes at University Cultural Competition',
                    'slug' => 'members-win-cultural-competition',
                    'excerpt' => 'Our members achieved outstanding results in traditional dance, singing and essay writing categories.',
                    'content' => '<p>We are proud to announce that our members won multiple prizes at the university cultural competition. Students competed in traditional dance, Mon singing, essay writing and public speaking.</p><p>Congratulations to all participants for their hard work, discipline and beautiful performances. You have made our association and community proud.</p>',
                ],
                'my' => [
                    'title' => 'MLCA အဖွဲ့ဝင်များ တက္ကသိုလ်ယဉ်ကျေးမှုပြိုင်ပွဲတွင် ဆုများရရှိ',
                    'slug' => 'members-win-cultural-competition-my',
                    'excerpt' => 'ကျွန်ုပ်တို့အဖွဲ့ဝင်များသည် ရိုးရာအက၊ အဆိုနှင့် စာစီစာကုံးကဏ္ဍများတွင် ထူးချွန်စွာ အောင်မြင်ခဲ့သည်။',
                    'content' => '<p>တက္ကသိုလ်ယဉ်ကျေးမှုပြိုင်ပွဲတွင် ကျွန်ုပ်တို့အဖွဲ့ဝင်များ ဆုများစွာ ရရှိခဲ့သည့်အတွက် ဂုဏ်ယူဝမ်းမြောက်ပါသည်။ ရိုးရာအက၊ မွန်အဆို၊ စာစီစာကုံးနှင့် လူထုရှေ့ဟောပြောခြင်းကဏ္ဍများတွင် ဝင်ရောက်ယှဉ်ပြိုင်ခဲ့သည်။</p>',
                ],
                'mnw' => [
                    'title' => 'ကောန်ဂကောံ MLCA ကလိဂွံလာင် ပ္ဍဲပြိုင်ပွဲယဥ်ကျေးမှုတက္ကသိုလ်',
                    'slug' => 'members-win-cultural-competition-mnw',
                    'excerpt' => 'ကောန်ဂကောံပိုဲ ကလိဂွံလာင် ပ္ဍဲအကရိုးရာ၊ ဒွက်မန် ကေုာံ လိက်ပရေင်ရ။',
                    'content' => '<p>ပ္ဍဲပြိုင်ပွဲယဥ်ကျေးမှုတက္ကသိုလ် ကောန်ဂကောံပိုဲ ကလိဂွံလာင် နာနာသာ်ရ။ ညးတအ် ပြိုင်လဝ် အကရိုးရာ၊ ဒွက်မန်၊ လိက်ပရေင် ကေုာံ ဟီုဂးရ။</p>',
                ],
            ],
        ];

        foreach ($posts as $index => $data) {
            $post = Post::create([
                'user_id' => 1,
                'category_id' => $this->categories[$data['category']]->id,
                'cover_image' => $data['cover'],
                'status' => 'published',
                'is_featured' => $data['featured'],
                'published_at' => now()->subDays($data['days']),
                'views' => rand(80, 900),
            ]);

            foreach (['en', 'my', 'mnw'] as $locale) {
                $post->translations()->create(array_merge($data[$locale], ['locale' => $locale]));
            }

            $this->attachMedia($post, $data['media']);
        }
    }

    protected function seedActivities(): void
    {
        $activities = [
            [
                'category' => 'cultural-activities',
                'status' => 'upcoming',
                'start' => now()->addDays(25),
                'time' => ['09:00', '15:00'],
                'location' => 'Hpa-An',
                'cover' => 'uploads/seed/activity1.jpg',
                'media' => ['uploads/seed/gallery1.jpg', 'uploads/seed/gallery2.jpg'],
                'en' => ['title' => 'Mon National Day Celebration', 'slug' => 'mon-national-day-celebration', 'description' => 'A full day cultural celebration with traditional performances, exhibitions and community activities.', 'content' => '<p>Join us for a full day of Mon cultural celebration including dance, music, literature exhibitions, traditional food and community games.</p>'],
                'my' => ['title' => 'မွန်အမျိုးသားနေ့ အခမ်းအနား', 'slug' => 'mon-national-day-celebration-my', 'description' => 'ရိုးရာဖျော်ဖြေပွဲများ၊ ပြပွဲများနှင့် လူမှုရေးလှုပ်ရှားမှုများဖြင့် တစ်နေကုန် ယဉ်ကျေးမှုပွဲ။', 'content' => '<p>အကနှင့်ဂီတ၊ စာပေပြပွဲ၊ ရိုးရာအစားအစာနှင့် ကစားပွဲများ ပါဝင်မည့် မွန်ယဉ်ကျေးမှုနေ့ကို ကျင်းပပါမည်။</p>'],
                'mnw' => ['title' => 'သဘင်တ္ၚဲကောန်ဂကူမန်', 'slug' => 'mon-national-day-celebration-mnw', 'description' => 'သဘင်ယဥ်ကျေးမှု မွဲတ္ၚဲ နကဵုအကရိုးရာ၊ ပြပွဲ ကေုာံ ကမၠောန်ကောန်ဂကူ။', 'content' => '<p>ကၠုင်ပံင်ကောံ သဘင်ယဥ်ကျေးမှုမန် မွဲတ္ၚဲ နကဵုအကရိုးရာ၊ ဂီတ၊ ပြပွဲလိက်ပတ် ကေုာံ စပ္ၚာန်ရိုးရာရ။</p>'],
            ],
            [
                'category' => 'cultural-activities',
                'status' => 'upcoming',
                'start' => now()->addDays(48),
                'time' => ['10:00', '16:00'],
                'location' => 'University Campus',
                'cover' => 'uploads/seed/activity2.jpg',
                'media' => ['uploads/seed/gallery3.jpg', 'uploads/seed/gallery4.jpg', 'uploads/seed/gallery5.jpg'],
                'en' => ['title' => 'Mon Traditional Cultural Event', 'slug' => 'mon-traditional-cultural-event', 'description' => 'An interactive cultural event featuring traditional dance, music and Mon script demonstrations.', 'content' => '<p>Experience Mon traditions through interactive workshops, dance demonstrations and a Mon script corner.</p>'],
                'my' => ['title' => 'မွန်ရိုးရာယဉ်ကျေးမှုပွဲ', 'slug' => 'mon-traditional-cultural-event-my', 'description' => 'ရိုးရာအက၊ ဂီတနှင့် မွန်စာလုံးသရုပ်ပြမှုများ ပါဝင်သော ယဉ်ကျေးမှုပွဲ။', 'content' => '<p>အလုပ်ရုံများ၊ အကသရုပ်ပြမှုများနှင့် မွန်စာလုံးထောင့်များဖြင့် မွန်ရိုးရာကို ခံစားပါ။</p>'],
                'mnw' => ['title' => 'သဘင်ယဥ်ကျေးမှုရိုးရာမန်', 'slug' => 'mon-traditional-cultural-event-mnw', 'description' => 'သဘင်ယဥ်ကျေးမှု နကဵုအကရိုးရာ၊ ဂီတ ကေုာံ သရုပ်ပြလိက်မန်။', 'content' => '<p>ဗတောန်ကွတ်၊ အကသရုပ် ကေုာံ ထောင့်လိက်မန် ပါလုပ်ရ။</p>'],
            ],
            [
                'category' => 'academic-activities',
                'status' => 'upcoming',
                'start' => now()->addDays(70),
                'time' => ['08:30', '12:00'],
                'location' => 'Main Hall, UCS Hpa-An',
                'cover' => 'uploads/seed/activity3.jpg',
                'media' => ['uploads/seed/gallery6.jpg'],
                'en' => ['title' => 'Student Welcome Ceremony', 'slug' => 'student-welcome-ceremony', 'description' => 'Welcome event for new students with orientation, cultural presentation and refreshments.', 'content' => '<p>Meet the committee, learn about our programs and enjoy a short cultural performance prepared by our members.</p>'],
                'my' => ['title' => 'ကျောင်းသားကြိုဆိုပွဲ', 'slug' => 'student-welcome-ceremony-my', 'description' => 'မိတ်ဆက်ပွဲ၊ ယဉ်ကျေးမှုတင်ဆက်မှုနှင့် ဧည့်ခံပွဲဖြင့် ကျောင်းသားအသစ်များကို ကြိုဆိုခြင်း။', 'content' => '<p>ကော်မတီနှင့် တွေ့ဆုံပြီး ကျွန်ုပ်တို့၏ အစီအစဉ်များကို လေ့လာကာ အဖွဲ့ဝင်များ၏ ယဉ်ကျေးမှုဖျော်ဖြေမှုကို ခံစားပါ။</p>'],
                'mnw' => ['title' => 'သဘင်ပံင်ကောံကွးဘာ', 'slug' => 'student-welcome-ceremony-mnw', 'description' => 'သဘင်မိတ်ဆက် ကေုာံ ပံင်ကောံကွးဘာတၟိ။', 'content' => '<p>ဆဵုကေတ်ကမ္မတဳ ကေုာံ ဗတောန်ဂကောံ ကေုာံ ခံစားဖျော်ဖြေယဥ်ကျေးမှု။</p>'],
            ],
            [
                'category' => 'community-service',
                'status' => 'completed',
                'start' => now()->subMonths(2),
                'time' => ['08:00', '13:00'],
                'location' => 'Hpa-An Township',
                'cover' => 'uploads/seed/activity4.jpg',
                'media' => ['uploads/seed/gallery7.jpg', 'uploads/seed/gallery8.jpg'],
                'en' => ['title' => 'Community Clean-Up and Donation Program', 'slug' => 'community-clean-up-donation', 'description' => 'Members cleaned the community area and donated school supplies to local children.', 'content' => '<p>Thank you to all volunteers who joined our community clean-up and donation program. Together we collected waste, planted trees and donated school supplies.</p>'],
                'my' => ['title' => 'လူမှုအသိုင်းအဝိုင်း သန့်ရှင်းရေးနှင့် လှူဒါန်းပွဲ', 'slug' => 'community-clean-up-donation-my', 'description' => 'အဖွဲ့ဝင်များသည် လူမှုအသိုင်းအဝိုင်းကို သန့်ရှင်းရေးလုပ်ပြီး ကလေးများအတွက် စာရေးကိရိယာများ လှူဒါန်းခဲ့သည်။', 'content' => '<p>သန့်ရှင်းရေးနှင့် လှူဒါန်းပွဲတွင် ပါဝင်ခဲ့သော စေတနာ့ဝန်ထမ်းအားလုံးကို ကျေးဇူးတင်ပါသည်။</p>'],
                'mnw' => ['title' => 'ကမၠောန်သအးဇ္ၚး ကေုာံ ဒုင်ဒါန်ကောန်ဂကူ', 'slug' => 'community-clean-up-donation-mnw', 'description' => 'ကောန်ဂကောံတအ် ဗိုင်သအးဇ္ၚး ကေုာံ ဒုင်ဒါန်ပညာ သွက်ကောန်ၚာ်။', 'content' => '<p>ကျေးဇူးတင်စေတနာ့ဝန်ထမ်းတအ် မပါလုပ်လဝ် ပ္ဍဲကမၠောန်သအးဇ္ၚးကဵုဒါန်ရ။</p>'],
            ],
            [
                'category' => 'academic-activities',
                'status' => 'completed',
                'start' => now()->subMonths(5),
                'time' => ['09:00', '11:30'],
                'location' => 'Seminar Room, UCS Hpa-An',
                'cover' => 'uploads/seed/post4.jpg',
                'media' => [],
                'en' => ['title' => 'Mon Literature Seminar', 'slug' => 'mon-literature-seminar', 'description' => 'A seminar on Mon literature with guest writers and student presentations.', 'content' => '<p>The seminar brought together writers, teachers and students to discuss the richness of Mon literature and its future.</p>'],
                'my' => ['title' => 'မွန်စာပေ ဟောပြောပွဲ', 'slug' => 'mon-literature-seminar-my', 'description' => 'ဧည့်စာရေးဆရာများနှင့် ကျောင်းသားတင်ဆက်မှုများပါဝင်သော မွန်စာပေဟောပြောပွဲ။', 'content' => '<p>စာရေးဆရာများ၊ ဆရာများနှင့် ကျောင်းသားများ စုပေါင်းပြီး မွန်စာပေ၏ ကြွယ်ဝမှုနှင့် အနာဂတ်ကို ဆွေးနွေးခဲ့သည်။</p>'],
                'mnw' => ['title' => 'ဟောပြောပွဲလိက်ပတ်မန်', 'slug' => 'mon-literature-seminar-mnw', 'description' => 'ဟောပြောပွဲလိက်ပတ်မန် ကေုာံ တင်ဆက်ကွးဘာ။', 'content' => '<p>ညးချူလိက်၊ ကျာ် ကေုာံ ကွးဘာတအ် ပံင်ကောံ ဆွေးနွေးပရောဟ်လိက်ပတ်မန်ရ။</p>'],
            ],
        ];

        foreach ($activities as $data) {
            $activity = Activity::create([
                'category_id' => $this->categories[$data['category']]->id,
                'status' => $data['status'],
                'start_date' => $data['start']->toDateString(),
                'end_date' => $data['start']->toDateString(),
                'start_time' => $data['time'][0],
                'end_time' => $data['time'][1],
                'location' => $data['location'],
                'cover_image' => $data['cover'],
                'is_featured' => $data['status'] !== 'completed',
            ]);

            foreach (['en', 'my', 'mnw'] as $locale) {
                $activity->translations()->create(array_merge($data[$locale], ['locale' => $locale]));
            }

            $this->attachMedia($activity, $data['media']);
        }
    }

    protected function seedEvents(): void
    {
        $events = [
            [
                'category' => 'cultural-events',
                'status' => 'upcoming',
                'start' => now()->addDays(35),
                'location' => 'University Auditorium, Hpa-An',
                'cover' => 'uploads/seed/event1.jpg',
                'registration' => 'Free entry. Register at the association office or via the registration desk on the day of the event.',
                'media' => ['uploads/seed/gallery1.jpg', 'uploads/seed/gallery4.jpg'],
                'en' => ['title' => 'Mon Cultural Festival 2026', 'slug' => 'mon-cultural-festival-2026', 'description' => 'The biggest Mon cultural festival of the year with performances, food, art and community activities.', 'content' => '<p>Join us for the Mon Cultural Festival 2026. Enjoy traditional dance and music, Mon food stalls, literature exhibitions, art displays and games for all ages.</p><h2>Festival Highlights</h2><ul><li>Traditional Mon dance and music</li><li>Mon cuisine fair</li><li>Literature and art exhibition</li><li>Cultural games and competitions</li></ul>'],
                'my' => ['title' => '၂၀၂၆ မွန်ယဉ်ကျေးမှုပွဲတော်', 'slug' => 'mon-cultural-festival-2026-my', 'description' => 'တစ်နှစ်တာ၏ အကြီးမားဆုံး မွန်ယဉ်ကျေးမှုပွဲတော်။', 'content' => '<p>ဖျော်ဖြေပွဲများ၊ အစားအစာ၊ အနုပညာနှင့် လူမှုရေးလှုပ်ရှားမှုများဖြင့် မွန်ယဉ်ကျေးမှုပွဲတော်ကို ကျင်းပပါမည်။</p><h2>ပွဲတော်အထူးများ</h2><ul><li>မွန်ရိုးရာအကနှင့်ဂီတ</li><li>မွန်အစားအစာဈေး</li><li>စာပေနှင့်အနုပညာပြပွဲ</li><li>ယဉ်ကျေးမှုကစားပွဲများ</li></ul>'],
                'mnw' => ['title' => 'သဘင်ယဥ်ကျေးမှုမန် ၂၀၂၆', 'slug' => 'mon-cultural-festival-2026-mnw', 'description' => 'သဘင်ယဥ်ကျေးမှုမန် ဇၞော်အိုတ် ပ္ဍဲသၞာံ။', 'content' => '<p>ကၠုင်ပံင်ကောံ သဘင်ယဥ်ကျေးမှုမန် ၂၀၂၆ နကဵုအကရိုးရာ၊ ဂီတ၊ စပ္ၚာန်စၞမန် ကေုာံ ပြပွဲအနုပညာရ။</p>'],
            ],
            [
                'category' => 'university-events',
                'status' => 'upcoming',
                'start' => now()->addDays(60),
                'location' => 'Seminar Hall, UCS Hpa-An',
                'cover' => 'uploads/seed/event2.jpg',
                'registration' => 'Seats are limited. Please register with the association secretary before the deadline.',
                'media' => ['uploads/seed/gallery7.jpg'],
                'en' => ['title' => 'Mon Literature and Language Seminar', 'slug' => 'mon-literature-language-seminar', 'description' => 'A seminar featuring Mon writers, language teachers and student researchers.', 'content' => '<p>Our seminar brings together Mon writers, language teachers and students to discuss the preservation and development of the Mon language and literature.</p>'],
                'my' => ['title' => 'မွန်စာပေနှင့်ဘာသာစကား ဟောပြောပွဲ', 'slug' => 'mon-literature-language-seminar-my', 'description' => 'မွန်စာရေးဆရာများ၊ ဘာသာစကားဆရာများနှင့် ကျောင်းသားသုတေသီများ ပါဝင်သော ဟောပြောပွဲ။', 'content' => '<p>မွန်ဘာသာစကားနှင့် စာပေ ထိန်းသိမ်းဖွံ့ဖြိုးရေးကို ဆွေးနွေးရန် စာရေးဆရာများ၊ ဆရာများနှင့် ကျောင်းသားများ စုပေါင်းကျင်းပပါမည်။</p>'],
                'mnw' => ['title' => 'ဟောပြောပွဲလိက်ပတ် ကေုာံ ဘာသာမန်', 'slug' => 'mon-literature-language-seminar-mnw', 'description' => 'ဟောပြောပွဲ ကေုာံ ညးချူလိက်မန်၊ ကျာ်ဘာသာ ကေုာံ ကွးဘာသုတေသန။', 'content' => '<p>ပံင်ကောံ ဆွေးနွေး ပရောဟ်မင်မဲ ကေုာံ ဖံင် ဘာသာမန် ကေုာံ လိက်ပတ်မန်ရ။</p>'],
            ],
            [
                'category' => 'ceremonies',
                'status' => 'completed',
                'start' => now()->subMonths(1),
                'location' => 'Main Hall, UCS Hpa-An',
                'cover' => 'uploads/seed/event3.jpg',
                'registration' => null,
                'media' => ['uploads/seed/gallery2.jpg', 'uploads/seed/gallery5.jpg', 'uploads/seed/gallery8.jpg'],
                'en' => ['title' => 'Annual Prize Giving Ceremony', 'slug' => 'annual-prize-giving-ceremony', 'description' => 'Celebrating the achievements of our members in academics and cultural competitions.', 'content' => '<p>We celebrated the achievements of our members who excelled in academics, cultural competitions and community service. Congratulations to all award recipients.</p>'],
                'my' => ['title' => 'နှစ်ပတ်လည် ဆုချီးမြှင့်ပွဲ', 'slug' => 'annual-prize-giving-ceremony-my', 'description' => 'ပညာရေးနှင့် ယဉ်ကျေးမှုပြိုင်ပွဲများတွင် အောင်မြင်မှုများကို ဂုဏ်ပြုခြင်း။', 'content' => '<p>ပညာရေး၊ ယဉ်ကျေးမှုပြိုင်ပွဲနှင့် လူမှုရေးလုပ်ငန်းများတွင် ထူးချွန်သော အဖွဲ့ဝင်များကို ဂုဏ်ပြုခဲ့သည်။</p>'],
                'mnw' => ['title' => 'သဘင်ကဵုဒါန်လာဘ် သၞာံစိုပ်', 'slug' => 'annual-prize-giving-ceremony-mnw', 'description' => 'ဂုဏ်ပြုလာဘ် တင်မြှောက်ကောန်ဂကောံ မအာင်ဇၞး။', 'content' => '<p>ဂုဏ်ပြုလာဘ် သွက်ကောန်ဂကောံ မအာင်ဇၞး ပ္ဍဲပညာ ကေုာံ ပြိုင်ပွဲယဥ်ကျေးမှုရ။</p>'],
            ],
            [
                'category' => 'cultural-events',
                'status' => 'completed',
                'start' => now()->subMonths(3),
                'location' => 'Community Hall, Hpa-An',
                'cover' => 'uploads/seed/gallery3.jpg',
                'registration' => null,
                'media' => ['uploads/seed/gallery6.jpg'],
                'en' => ['title' => 'Traditional Dance Showcase', 'slug' => 'traditional-dance-showcase', 'description' => 'A showcase of traditional Mon dance performed by our students.', 'content' => '<p>Our students performed a beautiful showcase of traditional Mon dance for the community. Thank you to everyone who joined and supported the event.</p>'],
                'my' => ['title' => 'ရိုးရာအက ဖျော်ဖြေပွဲ', 'slug' => 'traditional-dance-showcase-my', 'description' => 'ကျောင်းသားများ၏ မွန်ရိုးရာအက ဖျော်ဖြေမှု။', 'content' => '<p>ကျောင်းသားများသည် လူမှုအသိုင်းအဝိုင်းအတွက် လှပသော မွန်ရိုးရာအက ဖျော်ဖြေမှုကို တင်ဆက်ခဲ့သည်။</p>'],
                'mnw' => ['title' => 'ပွဲဖျော်ဖြေအကရိုးရာ', 'slug' => 'traditional-dance-showcase-mnw', 'description' => 'ပွဲဖျော်ဖြေ အကရိုးရာမန် နူကွးဘာပိုဲ။', 'content' => '<p>ကွးဘာပိုဲ ဖျော်ဖြေ အကရိုးရာမန် သွက်ကောန်ဂကူရ။</p>'],
            ],
        ];

        foreach ($events as $data) {
            $event = Event::create([
                'category_id' => $this->categories[$data['category']]->id,
                'status' => $data['status'],
                'start_date' => $data['start']->toDateString(),
                'end_date' => $data['start']->toDateString(),
                'start_time' => '09:00',
                'end_time' => '16:00',
                'location' => $data['location'],
                'cover_image' => $data['cover'],
                'registration_info' => $data['registration'],
                'is_featured' => $data['status'] === 'upcoming',
            ]);

            foreach (['en', 'my', 'mnw'] as $locale) {
                $event->translations()->create(array_merge($data[$locale], ['locale' => $locale]));
            }

            $this->attachMedia($event, $data['media']);
        }
    }

    protected function seedGallery(): void
    {
        $albums = [
            [
                'title' => 'Mon National Day Celebration', 'title_my' => 'မွန်အမျိုးသားနေ့ အခမ်းအနား', 'title_mnw' => 'သဘင်တ္ၚဲကောန်ဂကူမန်',
                'slug' => 'mon-national-day-celebration', 'category' => 'cultural-festivals',
                'description' => 'Photos from our vibrant Mon National Day celebration.',
                'cover' => 'uploads/seed/gallery1.jpg',
                'images' => ['uploads/seed/gallery1.jpg', 'uploads/seed/gallery2.jpg', 'uploads/seed/gallery3.jpg', 'uploads/seed/gallery4.jpg'],
            ],
            [
                'title' => 'Campus Life', 'title_my' => 'ကျောင်းဝင်းဘဝ', 'title_mnw' => 'ဘဝပ္ဍဲတက္ကသိုလ်',
                'slug' => 'campus-life', 'category' => 'campus-life',
                'description' => 'Moments from our daily activities on campus.',
                'cover' => 'uploads/seed/gallery5.jpg',
                'images' => ['uploads/seed/gallery5.jpg', 'uploads/seed/gallery6.jpg', 'uploads/seed/gallery7.jpg'],
            ],
            [
                'title' => 'Traditional Dance Performances', 'title_my' => 'ရိုးရာအက ဖျော်ဖြေပွဲများ', 'title_mnw' => 'ပွဲဖျော်ဖြေအကရိုးရာ',
                'slug' => 'traditional-dance-performances', 'category' => 'traditional-dance',
                'description' => 'Our students performing traditional Mon dance.',
                'cover' => 'uploads/seed/gallery8.jpg',
                'images' => ['uploads/seed/gallery8.jpg', 'uploads/seed/gallery2.jpg', 'uploads/seed/gallery4.jpg', 'uploads/seed/gallery6.jpg'],
            ],
        ];

        foreach ($albums as $index => $data) {
            $album = GalleryAlbum::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'title' => $data['title'],
                    'title_my' => $data['title_my'],
                    'title_mnw' => $data['title_mnw'],
                    'category_id' => $this->categories[$data['category']]->id,
                    'description' => $data['description'],
                    'cover_image' => $data['cover'],
                    'is_published' => true,
                    'order' => $index,
                ]
            );

            if ($album->images()->count() === 0) {
                foreach ($data['images'] as $i => $path) {
                    $album->images()->create(['image_path' => $path, 'order' => $i, 'caption' => $data['title']]);
                }
            }
        }
    }

    protected function seedVideos(): void
    {
        $videos = [
            [
                'title' => 'Mon Culture Documentary', 'title_my' => 'မွန်ယဉ်ကျေးမှု မှတ်တမ်းရုပ်ရှင်', 'title_mnw' => 'ဗီဒဳယောမှတ်တမ်းယဥ်ကျေးမှုမန်',
                'slug' => 'mon-culture-documentary', 'category' => 'documentaries',
                'description' => 'A short documentary exploring the beauty of Mon culture and traditions.',
                'thumbnail' => 'uploads/seed/video1.jpg', 'external_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            ],
            [
                'title' => 'Traditional Mon Dance Performance', 'title_my' => 'မွန်ရိုးရာအက ဖျော်ဖြေမှု', 'title_mnw' => 'ပွဲဖျော်ဖြေအကရိုးရာမန်',
                'slug' => 'traditional-mon-dance-performance', 'category' => 'performances',
                'description' => 'Students performing traditional Mon dance at the cultural festival.',
                'thumbnail' => 'uploads/seed/video2.jpg', 'external_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            ],
            [
                'title' => 'Mon Literature Lecture', 'title_my' => 'မွန်စာပေ ဟောပြောပွဲ', 'title_mnw' => 'ဟောပြောပွဲလိက်ပတ်မန်',
                'slug' => 'mon-literature-lecture', 'category' => 'lectures',
                'description' => 'A lecture on the history and future of Mon literature.',
                'thumbnail' => 'uploads/seed/video3.jpg', 'external_url' => 'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
            ],
        ];

        foreach ($videos as $data) {
            Video::updateOrCreate(
                ['slug' => $data['slug']],
                [
                    'category_id' => $this->categories[$data['category']]->id,
                    'title' => $data['title'],
                    'title_my' => $data['title_my'],
                    'title_mnw' => $data['title_mnw'],
                    'description' => $data['description'],
                    'thumbnail' => $data['thumbnail'],
                    'external_url' => $data['external_url'],
                    'type' => 'youtube',
                    'published_at' => now()->subDays(rand(3, 40)),
                    'is_published' => true,
                    'views' => rand(50, 900),
                ]
            );
        }
    }

    protected function seedDocuments(): void
    {
        $documents = [
            ['title' => 'MLCA Annual Report 2026', 'title_my' => 'MLCA ၂၀၂၆ နှစ်ပတ်လည် အစီရင်ခံစာ', 'title_mnw' => 'ရေဒါင်စာသၞာံ MLCA ၂၀၂၆', 'category' => 'reports', 'file' => 'document1.pdf'],
            ['title' => 'Mon Cultural Guidelines', 'title_my' => 'မွန်ယဉ်ကျေးမှု လမ်းညွှန်', 'title_mnw' => 'လိက်လမ်းညွှန်ယဥ်ကျေးမှုမန်', 'category' => 'cultural-documents', 'file' => 'document2.pdf'],
            ['title' => 'MLCA Constitution', 'title_my' => 'MLCA ဖွဲ့စည်းပုံအခြေခံဥပဒေ', 'title_mnw' => 'သၞောဝ်ဒက်ပ္တန်ဂကောံ MLCA', 'category' => 'policies', 'file' => 'document3.pdf'],
        ];

        foreach ($documents as $data) {
            $path = 'uploads/seed/'.$data['file'];
            Document::updateOrCreate(
                ['title' => $data['title']],
                [
                    'title_my' => $data['title_my'],
                    'title_mnw' => $data['title_mnw'],
                    'category_id' => $this->categories[$data['category']]->id,
                    'description' => 'Official document of the Mon Literature and Culture Association.',
                    'file_path' => $path,
                    'file_name' => $data['file'],
                    'mime_type' => 'application/pdf',
                    'file_size' => Storage::disk('public')->exists($path) ? Storage::disk('public')->size($path) : 0,
                    'downloads' => rand(10, 200),
                    'is_published' => true,
                ]
            );
        }
    }

    protected function seedMembers(): void
    {
        $members = [
            ['photo' => 'member1.jpg', 'executive' => true, 'order' => 1, 'dept' => 'Computer Science', 'year' => 'Final Year', 'email' => 'chair@mlca.edu',
                'en' => ['name' => 'Nai Banya Lwei', 'position' => 'Chairperson', 'biography' => 'A passionate advocate for Mon culture and student leadership.'],
                'my' => ['name' => 'နိုင်ဗညားလွေ', 'position' => 'ဥက္ကဋ္ဌ', 'biography' => 'မွန်ယဉ်ကျေးမှုနှင့် ကျောင်းသားခေါင်းဆောင်မှုကို ချစ်မြတ်နိုးသူ။'],
                'mnw' => ['name' => 'နာဲဗညာလွဳ', 'position' => 'ဥက္ကဋ္ဌ', 'biography' => 'ညးမဆာန်ယဥ်ကျေးမှုမန် ကေုာံ ခေါင်းဆောင်ကွးဘာ။']],
            ['photo' => 'member2.jpg', 'executive' => true, 'order' => 2, 'dept' => 'Computer Technology', 'year' => 'Final Year', 'email' => 'vice@mlca.edu',
                'en' => ['name' => 'Mi Saranya', 'position' => 'Vice Chairperson', 'biography' => 'Coordinates cultural programs and community partnerships.'],
                'my' => ['name' => 'မိသရည', 'position' => 'ဒုတိယဥက္ကဋ္ဌ', 'biography' => 'ယဉ်ကျေးမှုအစီအစဉ်များနှင့် လူမှုရေးပူးပေါင်းဆောင်ရွက်မှုများကို စီမံခန့်ခွဲသည်။'],
                'mnw' => ['name' => 'မိသရည', 'position' => 'ဒုတိယဥက္ကဋ္ဌ', 'biography' => 'စီမံကမၠောန်ယဥ်ကျေးမှု ကေုာံ ပံင်ကောံကောန်ဂကူ။']],
            ['photo' => 'member3.jpg', 'executive' => true, 'order' => 3, 'dept' => 'Information Science', 'year' => 'Third Year', 'email' => 'secretary@mlca.edu',
                'en' => ['name' => 'Nai Thiha', 'position' => 'General Secretary', 'biography' => 'Keeps the association organized and connected.'],
                'my' => ['name' => 'နိုင်သီဟ', 'position' => 'အထွေထွေအတွင်းရေးမှူး', 'biography' => 'အသင်း၏ စီမံခန့်ခွဲမှုနှင့် ဆက်သွယ်ရေးကို ဆောင်ရွက်သည်။'],
                'mnw' => ['name' => 'နာဲသဳဟ', 'position' => 'ညးအုပ်ကာနာနာ', 'biography' => 'စီမံဂကောံ ကေုာံ ဆက်စပ်ကောန်ဂကူ။']],
            ['photo' => 'member4.jpg', 'executive' => true, 'order' => 4, 'dept' => 'Computer Science', 'year' => 'Third Year', 'email' => 'treasurer@mlca.edu',
                'en' => ['name' => 'Mi Kanyar', 'position' => 'Treasurer', 'biography' => 'Manages the association finances with transparency.'],
                'my' => ['name' => 'မိကေညာ', 'position' => 'ဘဏ္ဍာရေးမှူး', 'biography' => 'အသင်း၏ ဘဏ္ဍာရေးကို ပွင့်လင်းစွာ စီမံခန့်ခွဲသည်။'],
                'mnw' => ['name' => 'မိကေညာ', 'position' => 'ညးစၞးဘဏ္ဍာ', 'biography' => 'စီမံဘဏ္ဍာဂကောံ နကဵုပွင့်လင်း။']],
            ['photo' => 'member5.jpg', 'executive' => true, 'order' => 5, 'dept' => 'Computer Networks', 'year' => 'Second Year', 'email' => 'events@mlca.edu',
                'en' => ['name' => 'Nai Rakkhita', 'position' => 'Event Coordinator', 'biography' => 'Plans and coordinates cultural events and activities.'],
                'my' => ['name' => 'နိုင်ရက္ခိတ', 'position' => 'ပွဲစီစဉ်ရေးမှူး', 'biography' => 'ယဉ်ကျေးမှုပွဲများနှင့် လှုပ်ရှားမှုများကို စီစဉ်သည်။'],
                'mnw' => ['name' => 'နာဲရက္ခိတ', 'position' => 'ညးစီမံသဘင်', 'biography' => 'စီမံသဘင်ယဥ်ကျေးမှု ကေုာံ ကမၠောန်။']],
            ['photo' => 'member6.jpg', 'executive' => true, 'order' => 6, 'dept' => 'Software Engineering', 'year' => 'Second Year', 'email' => 'culture@mlca.edu',
                'en' => ['name' => 'Mi Nanda', 'position' => 'Cultural Officer', 'biography' => 'Leads cultural research, dance and music programs.'],
                'my' => ['name' => 'မိနန္ဒာ', 'position' => 'ယဉ်ကျေးမှုတာဝန်ခံ', 'biography' => 'ယဉ်ကျေးမှုသုတေသန၊ အကနှင့်ဂီတအစီအစဉ်များကို ဦးဆောင်သည်။'],
                'mnw' => ['name' => 'မိနန္ဒာ', 'position' => 'ညးစၞးယဥ်ကျေးမှု', 'biography' => 'ဦးဆောင်သုတေသနယဥ်ကျေးမှု၊ အက ကေုာံ ဂီတ။']],
            ['photo' => 'member7.jpg', 'executive' => false, 'order' => 7, 'dept' => 'Computer Science', 'year' => 'First Year', 'email' => null,
                'en' => ['name' => 'Nai Vijaya', 'position' => 'Member', 'biography' => 'New member interested in Mon literature and design.'],
                'my' => ['name' => 'နိုင်ဝိဇယ', 'position' => 'အဖွဲ့ဝင်', 'biography' => 'မွန်စာပေနှင့် ဒီဇိုင်းကို စိတ်ဝင်စားသော အဖွဲ့ဝင်အသစ်။'],
                'mnw' => ['name' => 'နာဲဝိဇယ', 'position' => 'ကောန်ဂကောံ', 'biography' => 'ကောန်ဂကောံတၟိ မဆာန်လိက်ပတ်မန် ကေုာံ ဒီဇိုင်း။']],
            ['photo' => 'member8.jpg', 'executive' => false, 'order' => 8, 'dept' => 'Information Science', 'year' => 'First Year', 'email' => null,
                'en' => ['name' => 'Mi Sanda', 'position' => 'Member', 'biography' => 'Volunteer photographer for association events.'],
                'my' => ['name' => 'မိသန္တာ', 'position' => 'အဖွဲ့ဝင်', 'biography' => 'အသင်းပွဲများအတွက် စေတနာ့ဝန်ထမ်း ဓာတ်ပုံဆရာ။'],
                'mnw' => ['name' => 'မိသန္တာ', 'position' => 'ကောန်ဂကောံ', 'biography' => 'ဓာတ်ပုံဆရာစေတနာ သွက်သဘင်ဂကောံ။']],
        ];

        foreach ($members as $data) {
            $member = Member::updateOrCreate(
                ['photo' => 'uploads/seed/'.$data['photo']],
                [
                    'department' => $data['dept'],
                    'academic_year' => \App\Support\AcademicYear::current(),
                    'email' => $data['email'],
                    'is_executive' => $data['executive'],
                    'is_active' => true,
                    'order' => $data['order'],
                ]
            );

            foreach (['en', 'my', 'mnw'] as $locale) {
                $member->translations()->updateOrCreate(['locale' => $locale], $data[$locale]);
            }
        }
    }

    protected function seedAchievements(): void
    {
        $achievements = [
            ['title' => 'Best Cultural Student Organization', 'year' => '2026', 'icon' => 'trophy', 'description' => 'Recognized by the university for outstanding cultural programs.'],
            ['title' => 'Mon Literature Preservation Award', 'year' => '2025', 'icon' => 'book-open', 'description' => 'Awarded for our Mon script and literature documentation project.'],
            ['title' => 'Community Service Excellence', 'year' => '2025', 'icon' => 'heart-handshake', 'description' => 'Honored for our community clean-up and education support programs.'],
            ['title' => 'Traditional Dance Competition Champions', 'year' => '2024', 'icon' => 'award', 'description' => 'First place at the regional Mon cultural competition.'],
        ];

        foreach ($achievements as $i => $data) {
            Achievement::updateOrCreate(
                ['title' => $data['title']],
                array_merge($data, ['order' => $i, 'is_published' => true])
            );
        }
    }
}

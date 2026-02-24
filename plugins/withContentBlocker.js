const {
  withEntitlementsPlist,
  withDangerousMod,
  withXcodeProject,
} = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

// ============================================================
// Domain Blocklist (mirrors constants/blocklist.ts for Node.js)
// ============================================================
const BLOCKED_DOMAINS = [
  // -- Major tube sites --
  "viptube.com",
  "4tube.com",
  "pornhub.com",
  "xvideos.com",
  "xnxx.com",
  "xhamster.com",
  "redtube.com",
  "youporn.com",
  "tube8.com",
  "spankbang.com",
  "beeg.com",
  "drtuber.com",
  "sunporno.com",
  "txxx.com",
  "hdzog.com",
  "hclips.com",
  "upornia.com",
  "vjav.com",
  "tnaflix.com",
  "empflix.com",
  "porntrex.com",
  "eporner.com",
  "alohatube.com",
  "fapvid.com",
  "porntube.com",
  "pornone.com",
  "3movs.com",
  "porndig.com",
  "tubepornclassic.com",
  "anyporn.com",
  "bravotube.net",
  "sleazyneasy.com",
  "nuvid.com",
  "extremetube.com",
  "pornerbros.com",
  "bigfuck.tv",
  "vqporn.com",
  "fuq.com",
  "youjizz.com",
  "motherless.com",
  "ixxx.com",
  "pornmd.com",
  "thumbzilla.com",
  "porn.com",
  "porn300.com",
  "xbabe.com",
  "gotporn.com",
  "xozilla.com",
  "megatube.xxx",
  "hellporno.com",
  "proporn.com",
  "pinkrod.com",
  "tryboobs.com",
  "tubxporn.com",
  "fux.com",
  "pornhd.com",
  "pornhat.com",
  "xxxbunker.com",
  "fapcat.com",
  "definebabe.com",
  "katestube.com",
  "watchmygf.me",
  "befuck.com",
  "mylust.com",
  "sxyprn.com",
  "daftsex.com",
  "sextb.net",
  "pornrox.com",
  "fullporner.com",
  "fapster.xxx",
  "pornoxo.com",
  "cliphunter.com",
  "hdporn.net",
  "silverdaddies.com",
  "ashemaletube.com",
  // -- Aggregators / search engines --
  "nudevista.com",
  "tubegalore.com",
  "rexxx.com",
  "findtubes.com",
  "pornmaki.com",
  "tiava.com",
  "deviantclip.com",
  "lobstertube.com",
  "elephanttube.com",
  "sss.xxx",
  "booloo.com",
  "xxbrii.com",
  "al4a.com",
  "ampland.com",
  "boodigo.com",
  "kindgirls.com",
  "orsm.net",
  "theporndude.com",
  "alotporn.com",
  "keezmovies.com",
  "madthumbs.com",
  // -- Cam sites --
  "chaturbate.com",
  "stripchat.com",
  "cam4.com",
  "bongacams.com",
  "myfreecams.com",
  "livejasmin.com",
  "camsoda.com",
  "flirt4free.com",
  "imlive.com",
  "streamate.com",
  "jerkmate.com",
  "camfuze.com",
  "camonster.com",
  "cams.com",
  "xcams.com",
  "camwhores.tv",
  "recurbate.com",
  "xlovecam.com",
  "camster.com",
  "camversity.com",
  "slutroulette.com",
  "dirtyroulette.com",
  "chatrandom.com",
  "shagle.com",
  "camrabbit.com",
  "cherry.tv",
  "royalcams.com",
  "babepedia.com",
  // -- Premium / paid sites --
  "brazzers.com",
  "bangbros.com",
  "realitykings.com",
  "naughtyamerica.com",
  "digitalplayground.com",
  "wicked.com",
  "mofos.com",
  "tushy.com",
  "blacked.com",
  "deeper.com",
  "vixen.com",
  "twistys.com",
  "babes.com",
  "teamskeet.com",
  "fakehub.com",
  "fakehospital.com",
  "faketaxi.com",
  "sexart.com",
  "metart.com",
  "playboytv.com",
  "playboy.com",
  "penthouse.com",
  "hustler.com",
  "vivid.com",
  "private.com",
  "adulttime.com",
  "pornpros.com",
  "passion-hd.com",
  "puremature.com",
  "fantasyhd.com",
  "castingcouch-hd.com",
  "propertysex.com",
  "family.xxx",
  "girlsway.com",
  "milehighmedia.com",
  "evilangel.com",
  "julesjordan.com",
  "kink.com",
  "clips4sale.com",
  "iwantclips.com",
  "manyvids.com",
  "hotguysfuck.com",
  "men.com",
  "seancody.com",
  "corbinadams.com",
  "belami.com",
  "cockyboys.com",
  "helix.com",
  "lucaskazan.com",
  "dorcelclub.com",
  "joymii.com",
  "eroticax.com",
  "newsensations.com",
  "sweetsinner.com",
  "hardx.com",
  "darkx.com",
  "ztod.com",
  "transsensual.com",
  "devilsfilm.com",
  "grooby.com",
  "legalporno.com",
  "analvids.com",
  "spizoo.com",
  "bangbrosnetwork.com",
  "realitygang.com",
  "steppedupgames.com",
  "sislovesme.com",
  "momsteachsex.com",
  "pervmom.com",
  "filthyfamily.com",
  "bignaturals.com",
  // -- Hentai / anime / erotic animation --
  "aniporn.com",
  "hanime.tv",
  "nhentai.net",
  "hentaihaven.xxx",
  "hentaigasm.com",
  "hentaimama.com",
  "hentai2read.com",
  "simply-hentai.com",
  "tsumino.com",
  "hitomi.la",
  "e-hentai.org",
  "exhentai.org",
  "pururin.us",
  "pururin.to",
  "luscious.net",
  "multporn.net",
  "rule34.xxx",
  "rule34video.com",
  "rule34hentai.net",
  "paheal.net",
  "hentaistream.com",
  "animeidhentai.com",
  "uncensoredhentai.xxx",
  "hentaifox.com",
  "hentainexus.com",
  "nhenviewer.com",
  "muchohentai.com",
  "haho.moe",
  "koharu.to",
  "imhentai.xxx",
  "hentaihere.com",
  "animephile.com",
  "cartoon-sex.com",
  "xanimeporn.com",
  "fakku.net",
  "doujins.com",
  "myreadingmanga.info",
  "mangahentai.me",

  // -- Japanese erotic manga / doujin sites (from matomeura.jp) --
  "nijierogakuen.com",
  "shinshi-manga.net",
  "eroproject.com",
  "erozine.jp",
  "ero-cluster.com",
  "doujinnomori.com",
  "ita-do.com",
  "himebon.blog",
  "ecchi-island.com",
  "177pica.com",
  "mangalear.blog",
  "erobooks.net",
  "manga-mill.com",
  "asmhentai.com",
  "momon-ga.com",
  "jcomic.net",
  "akuma.moe",
  "nukemanga.com",
  "erocomic.net",
  "m-manga.net",
  "nijioma.blog",
  "ginmoe.com",
  "hentaizap.com",
  "hentai-no1.com",
  "d-read.com",
  "ore-nijigazo.com",
  "comic-tatiyomi.com",
  "doujinhibiki.net",
  "nyahentai.re",
  "tokueromanga.com",
  "hentaicovid.com",
  "buhidoh.net",
  "eromanga-sora.com",
  "ddd-smart.net",
  "lyretain.online",
  "kimootoko.net",
  "chijolica.com",
  "fevian.org",
  "ikinari-erodoujin.cc",
  "doujin-freee.cc",
  "ecchi-comics.com",
  "iyaerocomic.com",
  "wnacg.com",
  "henti-night.com",
  "caitlin.top",
  "4545comics.com",
  "eromanganote.com",
  "log-lio.com",
  "eromanga-life.com",
  "erocomi.site",
  "itaeromanga.com",
  "oreno-erohon.com",
  "eromanga-milf.com",
  "dousyoko.net",
  "eroc.site",
  "eromanga.matome-place.com",
  "com-hokan.site",
  "xn--gmq92kd2rm1kx34a.com",
  "h-library.com",
  "doujinantena.top",
  "doujinland.info",
  "eromanga-cafe.com",
  "lovecomicz.com",
  "doeromanga.com",
  "exploader.net",
  "eromanga-school.com",
  "dokuha.jp",
  "erodoujinlog.com",
  "book18.fans",
  "eromanga-park.net",
  "eromangajukujo.com",
  "eromanga-kamuro.com",
  "rokuhentai.com",
  "hentai-one.com",
  "eromanga-time.com",
  "nyahentai.red",
  "erodaizensyu.com",

  // -- Japanese adult (JAV) --
  "dmm.co.jp",
  "javlibrary.com",
  "javbus.com",
  "javfree.me",
  "javbangers.com",
  "javhd.com",
  "jav.guru",
  "javmost.com",
  "javdoe.com",
  "javfull.net",
  "javtiful.com",
  "njav.tv",
  "njavtv.com",
  "missav.com",
  "missav.live",
  "missav.ai",
  "missav.ws",
  "missav.fun",
  "missav.tv",
  "missav.net",
  "missav.org",
  "missav.to",
  "missav123.com",
  "supjav.com",
  "jable.tv",
  "thisav.com",
  "avgle.com",
  "caribbeancom.com",
  "tokyo-hot.com",
  "heyzo.com",
  "pacopacomama.com",
  "10musume.com",
  "muramura.tv",
  "1pondo.tv",
  "s-cute.com",
  "mywife.cc",
  "r18.com",
  "mgstage.com",
  "aventertainments.com",
  "javmodel.com",
  "javseen.tv",
  "javgg.net",
  "onejav.com",
  "javrave.club",
  "javcl.com",
  "highporn.net",
  "javhub.net",
  "netflav.com",
  "javfinder.la",
  "javmenu.com",
  "javtrailers.com",
  "bestjavporn.com",
  "fc2.com",
  "av01.tv",
  "7mmtv.sx",
  "tktube.com",
  "tokyomotion.net",
  "kissjav.com",
  "javmix.tv",
  "popjav.tv",
  "javgiga.com",
  "youav.com",
  "uraagesage.com",
  // -- Social / community / creator platforms --
  "onlyfans.com",
  "fansly.com",
  "justfor.fans",
  "loyalfans.com",
  "fancentro.com",
  "alua.com",
  "admireme.vip",
  "unfiltrd.com",
  "frisk.chat",
  "mym.fans",
  "fanvue.com",
  "stars.avn.com",
  "modelhub.com",
  "ifans.com",
  "ismygirl.com",
  // -- Image boards / boorus --
  "rule34.paheal.net",
  "gelbooru.com",
  "danbooru.donmai.us",
  "safebooru.org",
  "tbib.org",
  "sankakucomplex.com",
  "chan.sankakucomplex.com",
  "konachan.com",
  "yande.re",
  "e621.net",
  "realbooru.com",
  "booru.org",
  "xbooru.com",
  "rule34.us",
  "hypnohub.net",
  "atfbooru.ninja",
  // -- Reddit-like / forums --
  "sex.com",
  "imagefap.com",
  "erome.com",
  "scrolller.com",
  "fapello.com",
  "coomer.su",
  "simpcity.su",
  "forums.socialmediagirls.com",
  "kemono.su",
  "lewdthoughts.com",
  "literotica.com",
  "sexstories.com",
  "nifty.org",
  "asstr.org",
  "bdsmlibrary.com",
  "chyoa.com",
  "storiesonline.net",
  "mcstories.com",
  "noveltrove.com",
  // -- Escort / dating (adult-oriented) --
  "adultfriendfinder.com",
  "ashleymadison.com",
  "seeking.com",
  "skipthegames.com",
  "tryst.link",
  "eros.com",
  "slixa.com",
  "listcrawler.com",
  "escortdirectory.com",
  "bedpage.com",
  "adultsearch.com",
  "ts4rent.eu",
  "megapersonals.com",
  "privateturks.com",
  "rubmaps.ch",
  "usasexguide.nl",
  "eccie.net",
  "theeroticreview.com",
  "cityxguide.com",
  "humaniplex.com",
  // -- Leaked / revenge / deepfake --
  "mrdeepfakes.com",
  "deepfake.com",
  "deepfakeporn.net",
  "sexcelebrity.net",
  "celebjihad.com",
  "nudography.com",
  "ancensored.com",
  "thefappening.so",
  "fappening.com",
  "leakedbb.com",
  "famousboard.com",
  "phun.org",
  "forum.phun.org",
  "aznude.com",
  "twidouga.net",
  "twittervideotools.com",
  // -- Fetish / niche --
  "fetlife.com",
  "collarspace.com",
  "recon.com",
  "boundage.com",
  "xtube.com",
  "gaytube.com",
  "boyfriendtv.com",
  "pornhits.com",
  "zbporn.com",
  "xfreehd.com",
  "hdporncomics.com",
  "porncomics.com",
  "8muses.com",
  "mrporngeek.com",
  "femdomempire.com",
  "divinebitches.com",
  // -- Pirated / mirror / proxy sites --
  "pornhub-proxy.net",
  "xhamster-proxy.xyz",
  "pornhubpremium.com",
  "spankbang.party",
  "xvideos2.com",
  "xnxx2.com",
  "xhamster2.com",
  "xhamster.desi",
  // -- VR porn --
  "astalavr.com",
  "sexlikereal.com",
  "vrporn.com",
  "vrsmash.com",
  "vrbangers.com",
  "virtualrealporn.com",
  "wankzvr.com",
  "badoinkvr.com",
  "czechvr.com",
  "naughtyamericavr.com",
  "vrconk.com",
  "vrallure.com",
  "swallowbay.com",
  // -- Vintage / classic / niche specialty --
  "theclassicporn.com",
  "sexvid.xxx",
  "xfree.com",
  "camereonclip.com",
  "85po.com",
  "xeroporn.com",
  // -- Other well-known adult domains --
  "xpee.com",
  "peekvids.com",
  "porndoe.com",
  "pornpics.com",
  "pornpictures.com",
  "babesource.com",
  "femjoyhunter.com",
  "idealbabes.net",
  "elitebabes.com",
  "thehun.net",
  "planetsuzy.org",
  "tblop.com",
  "drunkenteen.com",
  "namethatporn.com",
  "iafd.com",
  "indexxx.com",
  "freeones.com",
  "eurobabeindex.com",
  "data18.com",
  "adultdvdtalk.com",
  "voyeurweb.com",
  "heavy-r.com",
  "efukt.com",
  "crazyshit.com",
  "bestgore.fun",
  "theync.com",
  "kaotic.com",
  "hoodsite.com",
  "sexyflanders.com",
  "documenting.io",
  "shockgore.com",
  "goregrish.com",
  "documenting.com",
  "sexymp4.com",
  "tubesafari.com",
  "pornovideoshub.com",
  "perfectgirls.net",
  "perfectgirls.xxx",
  "palimas.icu",
  "pornzog.com",
  "yespornplease.com",
  "pornktube.com",
  "luxuretv.com",
  "zoig.com",
  "xlecx.com",
  "vporn.com",
  "eroprofile.com",
  "findminutes.com",
  "erothots.com",
  "dirtyship.com",
  "thothub.lol",
  "leakhive.com",
  "sexmex.xxx",
  "analdin.com",
  "boundhub.com",
  "shooshtime.com",
  "daporn.com",
  "wetplace.com",
  "pornwild.com",
  "hdhole.com",
  "ruleporn.com",
  "desixx.net",
  "masalaboard.com",
  "indianpornvideos.com",
  "desixnxx.net",

  // -- Sites from pan-pan.co ranking (2026) --
  "hqporner.com",
  "85tube.com",
  "minnano-av.com",
  "nukistream.com",
  "masutabe.info",
  "domazona.jp",
  "wav.tv",
  "shiwalism.net",
  "lesbianmania.net",
  "penikuriclub.com",
  "javym.net",
  "xn--ncke9a8j.net",
  "hime-channel.com",
  "myfans.jp",
  "fuzokudx.com",
  "ure-sen.com",
  "fyptt.to",
];

/**
 * Generate Safari Content Blocker rules from the domain list.
 * Each domain gets a "block" rule with an if-domain trigger.
 */
function generateBlockerRules(domains) {
  return domains.map((domain) => ({
    trigger: {
      "url-filter": ".*",
      "if-domain": ["*" + domain],
    },
    action: {
      type: "block",
    },
  }));
}

/**
 * Generate the Swift code for the ContentBlockerRequestHandler.
 * Optimized to stream the file directly to Safari without loading into memory.
 */
function generateSwiftHandler() {
  return `import UIKit

class ContentBlockerRequestHandler: NSObject, NSExtensionRequestHandling {

    func beginRequest(with context: NSExtensionContext) {
        // Locate the blockerList.json in the bundle
        guard let url = Bundle(for: ContentBlockerRequestHandler.self).url(forResource: "blockerList", withExtension: "json") else {
            // If file not found, just complete request
            context.completeRequest(returningItems: [], completionHandler: nil)
            return
        }

        // Create an attachment directly from the file URL
        // This streams the file content to Safari without loading it into memory
        guard let attachment = NSItemProvider(contentsOf: url) else {
             context.cancelRequest(withError: NSError(domain: "ContentBlockerExtension", code: 1, userInfo: nil))
             return
        }

        let item = NSExtensionItem()
        item.attachments = [attachment]

        context.completeRequest(returningItems: [item], completionHandler: nil)
    }
}
`;
}

// ============================================================
// Sub-plugin 1: Add App Groups entitlement to main app
// ============================================================
function withAppGroupsEntitlement(config) {
  return withEntitlementsPlist(config, (config) => {
    const APP_GROUP = "group.rewire.app.com";
    const groups = config.modResults["com.apple.security.application-groups"] || [];
    if (!groups.includes(APP_GROUP)) {
      groups.push(APP_GROUP);
    }
    config.modResults["com.apple.security.application-groups"] = groups;
    return config;
  });
}

// ============================================================
// Sub-plugin 2: Write extension files to disk during prebuild
// ============================================================
function withExtensionFiles(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const iosPath = path.join(config.modRequest.platformProjectRoot);
      const extDir = path.join(iosPath, "ContentBlockerExtension");

      // Create extension directory
      fs.mkdirSync(extDir, { recursive: true });

      // Generate blockerList.json from curated domain list
      const rules = generateBlockerRules(BLOCKED_DOMAINS);
      console.log(`[ContentBlocker] Writing ${rules.length} rules to blockerList.json`);
      fs.writeFileSync(
        path.join(extDir, "blockerList.json"),
        JSON.stringify(rules)
      );

      // Write ContentBlockerRequestHandler.swift
      const handlerSwift = generateSwiftHandler();
      fs.writeFileSync(
        path.join(extDir, "ContentBlockerRequestHandler.swift"),
        handlerSwift
      );

      // Write Info.plist
      const infoPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>CFBundleDevelopmentRegion</key>
\t<string>$(DEVELOPMENT_LANGUAGE)</string>
\t<key>CFBundleDisplayName</key>
\t<string>Rewire Content Blocker</string>
\t<key>CFBundleExecutable</key>
\t<string>$(EXECUTABLE_NAME)</string>
\t<key>CFBundleIdentifier</key>
\t<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
\t<key>CFBundleInfoDictionaryVersion</key>
\t<string>6.0</string>
\t<key>CFBundleName</key>
\t<string>$(PRODUCT_NAME)</string>
\t<key>CFBundlePackageType</key>
\t<string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
\t<key>CFBundleShortVersionString</key>
\t<string>1.0</string>
\t<key>CFBundleVersion</key>
\t<string>1</string>
\t<key>NSExtension</key>
\t<dict>
\t\t<key>NSExtensionPointIdentifier</key>
\t\t<string>com.apple.Safari.content-blocker</string>
\t\t<key>NSExtensionPrincipalClass</key>
\t\t<string>$(PRODUCT_MODULE_NAME).ContentBlockerRequestHandler</string>
\t</dict>
</dict>
</plist>
`;
      fs.writeFileSync(path.join(extDir, "ContentBlockerExtension-Info.plist"), infoPlist);

      // Write ContentBlockerExtension.entitlements (App Group for UserDefaults sharing)
      const entitlementsPlist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
\t<key>com.apple.security.application-groups</key>
\t<array>
\t\t<string>group.rewire.app.com</string>
\t</array>
</dict>
</plist>
`;
      fs.writeFileSync(
        path.join(extDir, "ContentBlockerExtension.entitlements"),
        entitlementsPlist
      );

      return config;
    },
  ]);
}

// ============================================================
// Sub-plugin 3: Add extension target to Xcode project
// ============================================================
function withExtensionTarget(config) {
  return withXcodeProject(config, (config) => {
    const project = config.modResults;
    const EXTENSION_NAME = "ContentBlockerExtension";
    const EXTENSION_BUNDLE_ID = "rewire.app.com.ContentBlockerExtension";

    // Add the app extension target
    const target = project.addTarget(
      EXTENSION_NAME,
      "app_extension",
      EXTENSION_NAME,
      EXTENSION_BUNDLE_ID
    );

    // Add build configuration settings for the extension target
    const configListUuid = target.pbxNativeTarget.buildConfigurationList;
    const configList = project.pbxXCConfigurationList()[configListUuid];

    if (configList && configList.buildConfigurations) {
      for (const buildConfig of configList.buildConfigurations) {
        const configUuid = buildConfig.value;
        const xcBuildConfig =
          project.pbxXCBuildConfigurationSection()[configUuid];
        if (xcBuildConfig) {
          xcBuildConfig.buildSettings =
            xcBuildConfig.buildSettings || {};
          Object.assign(xcBuildConfig.buildSettings, {
            SWIFT_VERSION: "5.0",
            IPHONEOS_DEPLOYMENT_TARGET: "15.1",
            PRODUCT_BUNDLE_IDENTIFIER: `"${EXTENSION_BUNDLE_ID}"`,
            INFOPLIST_FILE: `"${EXTENSION_NAME}/${EXTENSION_NAME}-Info.plist"`,
            CODE_SIGN_STYLE: "Automatic",
            DEVELOPMENT_TEAM: "KV6CYPA7JK",
            TARGETED_DEVICE_FAMILY: `"1,2"`,
            GENERATE_INFOPLIST_FILE: "NO",
            MARKETING_VERSION: "1.0",
            CURRENT_PROJECT_VERSION: "1",
            SWIFT_EMIT_LOC_STRINGS: "YES",
            CODE_SIGN_ENTITLEMENTS: `"${EXTENSION_NAME}/${EXTENSION_NAME}.entitlements"`,
          });
        }
      }
    }

    // Add source files and resources to the extension target
    const groupName = EXTENSION_NAME;

    // Create group with all extension files
    const extGroup = project.addPbxGroup(
      [
        "ContentBlockerRequestHandler.swift",
        "ContentBlockerExtension-Info.plist",
        "ContentBlockerExtension.entitlements",
        "blockerList.json",
      ],
      groupName,
      groupName
    );

    // Add group to main project group
    const mainGroup = project.getFirstProject().firstProject.mainGroup;
    project.addToPbxGroup(extGroup.uuid, mainGroup);

    // Use addBuildPhase to add sources and resources to the target
    project.addBuildPhase(
      [`${EXTENSION_NAME}/ContentBlockerRequestHandler.swift`],
      "PBXSourcesBuildPhase",
      "Sources",
      target.uuid
    );

    project.addBuildPhase(
      [`${EXTENSION_NAME}/blockerList.json`],
      "PBXResourcesBuildPhase",
      "Resources",
      target.uuid
    );

    return config;
  });
}

// ============================================================
// Main plugin: chain all sub-plugins
// ============================================================
function withContentBlocker(config) {
  config = withAppGroupsEntitlement(config);
  config = withExtensionFiles(config);
  config = withExtensionTarget(config);
  return config;
}

withContentBlocker.generateSwiftHandler = generateSwiftHandler;
module.exports = withContentBlocker;

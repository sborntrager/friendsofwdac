const textEncoder = new TextEncoder();
const ADMIN_SESSION_TTL_MS = 1000 * 60 * 60 * 8;
const ADMIN_RESET_TTL_MS = 1000 * 60 * 30;
const ADMIN_RESET_TTL_SECONDS = Math.floor(ADMIN_RESET_TTL_MS / 1000);
// Cloudflare Workers currently caps PBKDF2 iteration counts at 100000.
const ADMIN_PASSWORD_ITERATIONS = 100000;
const ADMIN_PASSWORD_HASH_BYTES = 32;
const ADMIN_SALT_BYTES = 16;
const ADMIN_USER_PREFIX = "admin:user:";
const ADMIN_RESET_PREFIX = "admin:reset:";
const ADMIN_PERSON_PREFIX = "admin:person:";
const ADMIN_MEMBER_PREFIX = "admin:member:";
const ADMIN_DONOR_PREFIX = "admin:donor:";
const ADMIN_IMPORT_PREFIX = "admin:import:";
const ADMIN_INBOX_PREFIX = "admin:inbox:";
const ADMIN_CONTENT_PREFIX = "admin:content:";
const ADMIN_ZOHO_OAUTH_STATE_PREFIX = "admin:zoho:oauth-state:";
const ADMIN_ZOHO_CONNECTION_KEY = "admin:zoho:connection";
const ADMIN_AUDIT_LOG_PREFIX = "admin:audit:";
const ADMIN_MIN_PASSWORD_LENGTH = 12;
const CONTACT_MAX_MESSAGE_LENGTH = 5000;
const ZOHO_OAUTH_STATE_TTL_SECONDS = 60 * 10;
const ZOHO_ACCESS_TOKEN_SKEW_MS = 60 * 1000;
const ZOHO_NEWSLETTER_MAX_RECIPIENTS = 75;
const ZOHO_TEST_MAX_RECIPIENTS = 5;
const DEFAULT_ALLOWED_ADMIN_EMAILS = [
  "shannonborntrager@gmail.com",
  "contact@friendsofwdac.org"
];
const ADMIN_EMAIL_ALIAS_MAP = {
  "contact@friendsofwdac.org": ["contact@friendsofwadc.org"],
  "contact@friendsofwadc.org": ["contact@friendsofwdac.org"]
};
const CONTENT_PAGE_PHASES = {
  home: 1,
  about: 1,
  membership: 2,
  donate: 2,
  history: 3,
  docs: 3,
  news: 3
};
const CONTENT_ALLOWED_FIELDS = {
  "home.hero.kicker": { kind: "text", maxLength: 180 },
  "home.hero.title": { kind: "text", maxLength: 180 },
  "home.hero.background.src": { kind: "asset", maxLength: 500 },
  "home.hero.primaryCta.label": { kind: "text", maxLength: 80 },
  "home.hero.primaryCta.href": { kind: "href", maxLength: 320 },
  "home.hero.secondaryCta.label": { kind: "text", maxLength: 80 },
  "home.hero.secondaryCta.href": { kind: "href", maxLength: 320 },
  "home.support.heading": { kind: "text", maxLength: 180 },
  "home.support.body": { kind: "text", maxLength: 2000 },
  "home.metrics.communityAccess.title": { kind: "text", maxLength: 120 },
  "home.metrics.communityAccess.body": { kind: "text", maxLength: 240 },
  "home.metrics.supporters.title": { kind: "text", maxLength: 120 },
  "home.metrics.supporters.body": { kind: "text", maxLength: 240 },
  "home.metrics.equipmentSupport.title": { kind: "text", maxLength: 120 },
  "home.metrics.equipmentSupport.body": { kind: "text", maxLength: 240 },
  "home.sections.about.title": { kind: "text", maxLength: 120 },
  "home.sections.about.body": { kind: "text", maxLength: 240 },
  "home.sections.about.cta.label": { kind: "text", maxLength: 80 },
  "home.sections.about.cta.href": { kind: "href", maxLength: 320 },
  "home.sections.history.title": { kind: "text", maxLength: 120 },
  "home.sections.history.body": { kind: "text", maxLength: 240 },
  "home.sections.history.cta.label": { kind: "text", maxLength: 80 },
  "home.sections.history.cta.href": { kind: "href", maxLength: 320 },
  "home.sections.membership.title": { kind: "text", maxLength: 120 },
  "home.sections.membership.body": { kind: "text", maxLength: 240 },
  "home.sections.membership.cta.label": { kind: "text", maxLength: 80 },
  "home.sections.membership.cta.href": { kind: "href", maxLength: 320 },
  "home.sections.news.title": { kind: "text", maxLength: 120 },
  "home.sections.news.body": { kind: "text", maxLength: 240 },
  "home.sections.news.cta.label": { kind: "text", maxLength: 80 },
  "home.sections.news.cta.href": { kind: "href", maxLength: 320 },
  "home.sections.docs.title": { kind: "text", maxLength: 120 },
  "home.sections.docs.body": { kind: "text", maxLength: 240 },
  "home.sections.docs.cta.label": { kind: "text", maxLength: 80 },
  "home.sections.docs.cta.href": { kind: "href", maxLength: 320 },
  "home.involved.kicker": { kind: "text", maxLength: 120 },
  "home.involved.membership.title": { kind: "text", maxLength: 120 },
  "home.involved.membership.body": { kind: "text", maxLength: 240 },
  "home.involved.membership.cta.label": { kind: "text", maxLength: 80 },
  "home.involved.membership.cta.href": { kind: "href", maxLength: 320 },
  "home.involved.donate.title": { kind: "text", maxLength: 120 },
  "home.involved.donate.body": { kind: "text", maxLength: 240 },
  "home.involved.donate.cta.label": { kind: "text", maxLength: 80 },
  "home.involved.donate.cta.href": { kind: "href", maxLength: 320 },
  "home.priorities.kicker": { kind: "text", maxLength: 120 },
  "home.priorities.title": { kind: "text", maxLength: 180 },
  "home.priorities.body": { kind: "text", maxLength: 240 },
  "home.priorities.newsLink.label": { kind: "text", maxLength: 80 },
  "home.priorities.newsLink.href": { kind: "href", maxLength: 320 },
  "home.priorities.historyLink.label": { kind: "text", maxLength: 80 },
  "home.priorities.historyLink.href": { kind: "href", maxLength: 320 },
  "home.priorities.budget.title": { kind: "text", maxLength: 120 },
  "home.priorities.budget.body": { kind: "text", maxLength: 240 },
  "home.priorities.organization.title": { kind: "text", maxLength: 120 },
  "home.priorities.organization.body": { kind: "text", maxLength: 240 },
  "home.priorities.programSupport.title": { kind: "text", maxLength: 120 },
  "home.priorities.programSupport.body": { kind: "text", maxLength: 240 },
  "home.cta.subscribe.eyebrow": { kind: "text", maxLength: 120 },
  "home.cta.subscribe.title": { kind: "text", maxLength: 160 },
  "home.cta.subscribe.body": { kind: "text", maxLength: 800 },
  "home.cta.subscribe.cta.label": { kind: "text", maxLength: 80 },
  "home.cta.subscribe.cta.href": { kind: "href", maxLength: 320 },
  "home.cta.contact.eyebrow": { kind: "text", maxLength: 120 },
  "home.cta.contact.title": { kind: "text", maxLength: 160 },
  "home.cta.contact.body": { kind: "text", maxLength: 800 },
  "home.cta.contact.cta.label": { kind: "text", maxLength: 80 },
  "about.hero.eyebrow": { kind: "text", maxLength: 120 },
  "about.hero.title": { kind: "text", maxLength: 180 },
  "about.hero.lead": { kind: "text", maxLength: 1200 },
  "about.hero.background.src": { kind: "asset", maxLength: 500 },
  "about.hero.primaryCta.label": { kind: "text", maxLength: 80 },
  "about.hero.primaryCta.href": { kind: "href", maxLength: 320 },
  "about.hero.secondaryCta.label": { kind: "text", maxLength: 80 },
  "about.hero.secondaryCta.href": { kind: "href", maxLength: 320 },
  "about.stats.communityAccess.title": { kind: "text", maxLength: 120 },
  "about.stats.communityAccess.body": { kind: "text", maxLength: 240 },
  "about.stats.supporters.title": { kind: "text", maxLength: 120 },
  "about.stats.supporters.body": { kind: "text", maxLength: 240 },
  "about.stats.equipmentSupport.title": { kind: "text", maxLength: 120 },
  "about.stats.equipmentSupport.body": { kind: "text", maxLength: 240 },
  "about.whoWeAre.title": { kind: "text", maxLength: 120 },
  "about.whoWeAre.body1": { kind: "text", maxLength: 2400 },
  "about.whoWeAre.body2": { kind: "text", maxLength: 2400 },
  "about.whoWeAre.body3": { kind: "text", maxLength: 2400 },
  "about.whoWeAre.sponsorLink.label": { kind: "text", maxLength: 160 },
  "about.whoWeAre.sponsorLink.href": { kind: "href", maxLength: 320 },
  "about.whoWeAre.wdacLinkPrefix": { kind: "text", maxLength: 120 },
  "about.whoWeAre.wdacLink.label": { kind: "text", maxLength: 180 },
  "about.whoWeAre.wdacLink.href": { kind: "href", maxLength: 320 },
  "about.mission.body": { kind: "text", maxLength: 2400 },
  "about.objectives.title": { kind: "text", maxLength: 120 },
  "about.objectives.item1": { kind: "text", maxLength: 320 },
  "about.objectives.item2": { kind: "text", maxLength: 320 },
  "about.objectives.item3": { kind: "text", maxLength: 320 },
  "about.objectives.item4": { kind: "text", maxLength: 320 },
  "about.leadership.title": { kind: "text", maxLength: 120 },
  "about.leadership.steering.title": { kind: "text", maxLength: 120 },
  "about.leadership.steering.member1": { kind: "text", maxLength: 180 },
  "about.leadership.steering.member2": { kind: "text", maxLength: 180 },
  "about.leadership.steering.member3": { kind: "text", maxLength: 180 },
  "about.leadership.steering.member4": { kind: "text", maxLength: 180 },
  "about.leadership.steering.member5": { kind: "text", maxLength: 180 },
  "about.leadership.steering.member6": { kind: "text", maxLength: 180 },
  "about.leadership.advisors.title": { kind: "text", maxLength: 120 },
  "about.leadership.advisors.member1": { kind: "text", maxLength: 180 },
  "about.leadership.advisors.member2": { kind: "text", maxLength: 180 },
  "about.impact.callout.title": { kind: "text", maxLength: 120 },
  "about.impact.callout.body": { kind: "text", maxLength: 2400 },
  "about.impact.title": { kind: "text", maxLength: 180 },
  "about.impact.body": { kind: "text", maxLength: 2400 },
  "about.leadership.image.src": { kind: "asset", maxLength: 500 },
  "about.leadership.image.alt": { kind: "text", maxLength: 240 },
  "about.leadership.image.captionTitle": { kind: "text", maxLength: 160 },
  "about.leadership.image.captionCredit": { kind: "text", maxLength: 240 },
  "about.gallery.lapSwimmer.image.src": { kind: "asset", maxLength: 500 },
  "about.gallery.lapSwimmer.image.alt": { kind: "text", maxLength: 240 },
  "about.gallery.lapSwimmer.captionTitle": { kind: "text", maxLength: 160 },
  "about.gallery.lapSwimmer.captionCredit": { kind: "text", maxLength: 240 },
  "about.gallery.adultExercise.image.src": { kind: "asset", maxLength: 500 },
  "about.gallery.adultExercise.image.alt": { kind: "text", maxLength: 240 },
  "about.gallery.adultExercise.captionTitle": { kind: "text", maxLength: 160 },
  "about.gallery.adultExercise.captionCredit": { kind: "text", maxLength: 240 },
  "about.gallery.childSwimmer.image.src": { kind: "asset", maxLength: 500 },
  "about.gallery.childSwimmer.image.alt": { kind: "text", maxLength: 240 },
  "about.gallery.childSwimmer.captionTitle": { kind: "text", maxLength: 160 },
  "about.gallery.childSwimmer.captionCredit": { kind: "text", maxLength: 240 },
  "about.gallery.seniorSwimmer.image.src": { kind: "asset", maxLength: 500 },
  "about.gallery.seniorSwimmer.image.alt": { kind: "text", maxLength: 240 },
  "about.gallery.seniorSwimmer.captionTitle": { kind: "text", maxLength: 160 },
  "about.gallery.seniorSwimmer.captionCredit": { kind: "text", maxLength: 240 },
  "about.testimonials.title": { kind: "text", maxLength: 120 },
  "about.testimonials.body": { kind: "text", maxLength: 400 },
  "about.testimonials.cta.label": { kind: "text", maxLength: 160 },
  "about.testimonials.cta.href": { kind: "href", maxLength: 320 },
  "about.testimonials.quote1": { kind: "text", maxLength: 800 },
  "about.testimonials.quote2": { kind: "text", maxLength: 800 },
  "about.testimonials.quote3": { kind: "text", maxLength: 800 },
  "about.sponsor.logo.src": { kind: "asset", maxLength: 500 },
  "about.sponsor.logo.alt": { kind: "text", maxLength: 240 },
  "about.sponsor.title": { kind: "text", maxLength: 180 },
  "about.sponsor.body": { kind: "text", maxLength: 1600 },
  "about.sponsor.background.title": { kind: "text", maxLength: 120 },
  "about.sponsor.background.item1": { kind: "text", maxLength: 320 },
  "about.sponsor.background.item2": { kind: "text", maxLength: 480 },
  "about.sponsor.links.prefix": { kind: "text", maxLength: 120 },
  "about.sponsor.links.article.label": { kind: "text", maxLength: 160 },
  "about.sponsor.links.article.href": { kind: "href", maxLength: 320 },
  "about.sponsor.links.pdf.label": { kind: "text", maxLength: 160 },
  "about.sponsor.links.pdf.href": { kind: "href", maxLength: 320 },
  "about.sponsor.leadership.title": { kind: "text", maxLength: 160 },
  "about.sponsor.leadership.contactName": { kind: "text", maxLength: 180 },
  "about.sponsor.leadership.emailPrefix": { kind: "text", maxLength: 80 },
  "about.sponsor.leadership.email.label": { kind: "text", maxLength: 160 },
  "about.sponsor.leadership.email.href": { kind: "href", maxLength: 320 },
  "about.sponsor.leadership.facebook.label": { kind: "text", maxLength: 160 },
  "about.sponsor.leadership.facebook.href": { kind: "href", maxLength: 320 },
  "about.cta.subscribe.eyebrow": { kind: "text", maxLength: 120 },
  "about.cta.subscribe.title": { kind: "text", maxLength: 160 },
  "about.cta.subscribe.body": { kind: "text", maxLength: 800 },
  "about.cta.subscribe.label": { kind: "text", maxLength: 80 },
  "about.cta.subscribe.href": { kind: "href", maxLength: 320 },
  "about.cta.contact.eyebrow": { kind: "text", maxLength: 120 },
  "about.cta.contact.title": { kind: "text", maxLength: 160 },
  "about.cta.contact.body": { kind: "text", maxLength: 800 },
  "about.cta.contact.label": { kind: "text", maxLength: 80 },
  "membership.hero.eyebrow": { kind: "text", maxLength: 120 },
  "membership.hero.title": { kind: "text", maxLength: 180 },
  "membership.hero.lead": { kind: "text", maxLength: 1200 },
  "membership.hero.primaryCta.label": { kind: "text", maxLength: 80 },
  "membership.hero.primaryCta.href": { kind: "href", maxLength: 320 },
  "membership.hero.secondaryCta.label": { kind: "text", maxLength: 80 },
  "membership.hero.secondaryCta.href": { kind: "href", maxLength: 320 },
  "membership.quickActions.title": { kind: "text", maxLength: 120 },
  "membership.quickActions.body": { kind: "text", maxLength: 1200 },
  "membership.quickActions.paymentCta.label": { kind: "text", maxLength: 80 },
  "membership.quickActions.paymentCta.href": { kind: "href", maxLength: 320 },
  "membership.quickActions.note.title": { kind: "text", maxLength: 120 },
  "membership.quickActions.note.body": { kind: "text", maxLength: 800 },
  "membership.benefits.allAges.title": { kind: "text", maxLength: 120 },
  "membership.benefits.allAges.body": { kind: "text", maxLength: 240 },
  "membership.benefits.volunteer.title": { kind: "text", maxLength: 120 },
  "membership.benefits.volunteer.body": { kind: "text", maxLength: 240 },
  "membership.benefits.flexibleGiving.title": { kind: "text", maxLength: 120 },
  "membership.benefits.flexibleGiving.body": { kind: "text", maxLength: 240 },
  "membership.benefits.stayConnected.title": { kind: "text", maxLength: 120 },
  "membership.benefits.stayConnected.body": { kind: "text", maxLength: 240 },
  "membership.members.title": { kind: "text", maxLength: 160 },
  "membership.members.body": { kind: "text", maxLength: 2400 },
  "membership.members.alumniPrefix": { kind: "text", maxLength: 120 },
  "membership.members.alumniLink.label": { kind: "text", maxLength: 180 },
  "membership.members.alumniLink.href": { kind: "href", maxLength: 320 },
  "membership.join.title": { kind: "text", maxLength: 120 },
  "membership.join.intro": { kind: "text", maxLength: 2400 },
  "membership.join.print.title": { kind: "text", maxLength: 120 },
  "membership.join.print.step1": { kind: "text", maxLength: 400 },
  "membership.join.print.step2": { kind: "text", maxLength: 400 },
  "membership.join.print.step3": { kind: "text", maxLength: 400 },
  "membership.join.print.payeeLabel": { kind: "text", maxLength: 120 },
  "membership.join.print.payeeBody": { kind: "text", maxLength: 240 },
  "membership.join.print.mailLabel": { kind: "text", maxLength: 120 },
  "membership.join.print.mailLine1": { kind: "text", maxLength: 160 },
  "membership.join.print.mailLine2": { kind: "text", maxLength: 160 },
  "membership.join.online.title": { kind: "text", maxLength: 160 },
  "membership.join.online.body": { kind: "text", maxLength: 1200 },
  "membership.join.status.title": { kind: "text", maxLength: 120 },
  "membership.join.status.body": { kind: "text", maxLength: 800 },
  "membership.gallery.title": { kind: "text", maxLength: 160 },
  "membership.gallery.seniorSwimmer.image.src": { kind: "asset", maxLength: 500 },
  "membership.gallery.seniorSwimmer.image.alt": { kind: "text", maxLength: 240 },
  "membership.gallery.seniorSwimmer.captionTitle": { kind: "text", maxLength: 160 },
  "membership.gallery.seniorSwimmer.captionCredit": { kind: "text", maxLength: 240 },
  "membership.gallery.toddlerSwimmer.image.src": { kind: "asset", maxLength: 500 },
  "membership.gallery.toddlerSwimmer.image.alt": { kind: "text", maxLength: 240 },
  "membership.gallery.toddlerSwimmer.captionTitle": { kind: "text", maxLength: 160 },
  "membership.gallery.toddlerSwimmer.captionCredit": { kind: "text", maxLength: 240 },
  "membership.gallery.lapSwim.image.src": { kind: "asset", maxLength: 500 },
  "membership.gallery.lapSwim.image.alt": { kind: "text", maxLength: 240 },
  "membership.gallery.lapSwim.captionTitle": { kind: "text", maxLength: 160 },
  "membership.gallery.lapSwim.captionCredit": { kind: "text", maxLength: 240 },
  "membership.gallery.adultWaterClass.image.src": { kind: "asset", maxLength: 500 },
  "membership.gallery.adultWaterClass.image.alt": { kind: "text", maxLength: 240 },
  "membership.gallery.adultWaterClass.captionTitle": { kind: "text", maxLength: 160 },
  "membership.gallery.adultWaterClass.captionCredit": { kind: "text", maxLength: 240 },
  "membership.utility.subscribe.title": { kind: "text", maxLength: 160 },
  "membership.utility.subscribe.body": { kind: "text", maxLength: 800 },
  "membership.utility.subscribe.label": { kind: "text", maxLength: 80 },
  "membership.utility.subscribe.href": { kind: "href", maxLength: 320 },
  "membership.utility.contact.title": { kind: "text", maxLength: 160 },
  "membership.utility.contact.body": { kind: "text", maxLength: 800 },
  "membership.utility.contact.label": { kind: "text", maxLength: 80 },
  "donate.hero.eyebrow": { kind: "text", maxLength: 120 },
  "donate.hero.title": { kind: "text", maxLength: 180 },
  "donate.hero.lead": { kind: "text", maxLength: 1200 },
  "donate.priorities.kicker": { kind: "text", maxLength: 120 },
  "donate.priorities.title": { kind: "text", maxLength: 220 },
  "donate.priorities.lead": { kind: "text", maxLength: 1200 },
  "donate.priorities.item1": { kind: "text", maxLength: 1200 },
  "donate.priorities.item2": { kind: "text", maxLength: 1200 },
  "donate.priorities.item3": { kind: "text", maxLength: 400 },
  "donate.priorities.item4": { kind: "text", maxLength: 400 },
  "donate.priorities.item5": { kind: "text", maxLength: 400 },
  "donate.priorities.primaryCta.label": { kind: "text", maxLength: 80 },
  "donate.priorities.primaryCta.href": { kind: "href", maxLength: 320 },
  "donate.general.title": { kind: "text", maxLength: 120 },
  "donate.general.body": { kind: "text", maxLength: 1200 },
  "donate.general.givebutter.label": { kind: "text", maxLength: 120 },
  "donate.general.givebutter.href": { kind: "href", maxLength: 320 },
  "donate.general.pdf.label": { kind: "text", maxLength: 120 },
  "donate.general.pdf.href": { kind: "href", maxLength: 320 },
  "donate.general.note.title": { kind: "text", maxLength: 120 },
  "donate.general.note.body": { kind: "text", maxLength: 800 },
  "donate.mail.title": { kind: "text", maxLength: 120 },
  "donate.mail.body": { kind: "text", maxLength: 800 },
  "donate.mail.payeeLabel": { kind: "text", maxLength: 160 },
  "donate.mail.payeeBody": { kind: "text", maxLength: 240 },
  "donate.mail.mailLabel": { kind: "text", maxLength: 120 },
  "donate.mail.mailLine1": { kind: "text", maxLength: 160 },
  "donate.mail.mailLine2": { kind: "text", maxLength: 160 },
  "donate.mail.note.title": { kind: "text", maxLength: 160 },
  "donate.mail.note.body": { kind: "text", maxLength: 800 },
  "donate.legacy.title": { kind: "text", maxLength: 160 },
  "donate.legacy.options.title": { kind: "text", maxLength: 160 },
  "donate.legacy.options.item1": { kind: "text", maxLength: 240 },
  "donate.legacy.options.item2": { kind: "text", maxLength: 240 },
  "donate.legacy.options.item3": { kind: "text", maxLength: 320 },
  "donate.legacy.options.item4": { kind: "text", maxLength: 320 },
  "donate.legacy.options.disclaimer": { kind: "text", maxLength: 1200 },
  "donate.legacy.recipient.title": { kind: "text", maxLength: 180 },
  "donate.legacy.recipient.nameLabel": { kind: "text", maxLength: 180 },
  "donate.legacy.recipient.nameValue": { kind: "text", maxLength: 240 },
  "donate.legacy.recipient.taxIdLabel": { kind: "text", maxLength: 120 },
  "donate.legacy.recipient.taxIdValue": { kind: "text", maxLength: 80 },
  "donate.legacy.recipient.addressLabel": { kind: "text", maxLength: 120 },
  "donate.legacy.recipient.addressLine1": { kind: "text", maxLength: 160 },
  "donate.legacy.recipient.addressLine2": { kind: "text", maxLength: 160 },
  "donate.legacy.recipient.emailLabel": { kind: "text", maxLength: 80 },
  "donate.legacy.recipient.email.label": { kind: "text", maxLength: 160 },
  "donate.legacy.recipient.email.href": { kind: "href", maxLength: 320 },
  "donate.legacy.cta.label": { kind: "text", maxLength: 120 },
  "donate.legacy.cta.href": { kind: "href", maxLength: 320 },
  "donate.shirt.title": { kind: "text", maxLength: 120 },
  "donate.shirt.body": { kind: "text", maxLength: 1600 },
  "donate.shirt.cta.label": { kind: "text", maxLength: 80 },
  "donate.shirt.cta.href": { kind: "href", maxLength: 320 },
  "donate.shirt.image.src": { kind: "asset", maxLength: 500 },
  "donate.shirt.image.alt": { kind: "text", maxLength: 240 },
  "donate.utility.subscribe.title": { kind: "text", maxLength: 160 },
  "donate.utility.subscribe.body": { kind: "text", maxLength: 800 },
  "donate.utility.subscribe.label": { kind: "text", maxLength: 80 },
  "donate.utility.subscribe.href": { kind: "href", maxLength: 320 },
  "donate.utility.contact.title": { kind: "text", maxLength: 160 },
  "donate.utility.contact.body": { kind: "text", maxLength: 800 },
  "donate.utility.contact.label": { kind: "text", maxLength: 80 },
  "donate.utility.thanks.title": { kind: "text", maxLength: 120 },
  "donate.utility.thanks.body": { kind: "text", maxLength: 800 },
  "donate.utility.thanks.label": { kind: "text", maxLength: 80 },
  "donate.utility.thanks.href": { kind: "href", maxLength: 320 },
  "history.hero.eyebrow": { kind: "text", maxLength: 120 },
  "history.hero.title": { kind: "text", maxLength: 180 },
  "history.hero.lead": { kind: "text", maxLength: 1200 },
  "history.stats.since1955.title": { kind: "text", maxLength: 120 },
  "history.stats.since1955.body": { kind: "text", maxLength: 240 },
  "history.stats.partnership.title": { kind: "text", maxLength: 180 },
  "history.stats.partnership.body": { kind: "text", maxLength: 240 },
  "history.stats.renovation.title": { kind: "text", maxLength: 120 },
  "history.stats.renovation.body": { kind: "text", maxLength: 240 },
  "history.stats.citySupport.title": { kind: "text", maxLength: 180 },
  "history.stats.citySupport.body": { kind: "text", maxLength: 240 },
  "history.overview.title": { kind: "text", maxLength: 160 },
  "history.overview.body1": { kind: "text", maxLength: 1800 },
  "history.overview.body2": { kind: "text", maxLength: 1800 },
  "history.partnership.title": { kind: "text", maxLength: 180 },
  "history.partnership.point1": { kind: "text", maxLength: 1200 },
  "history.partnership.point2": { kind: "text", maxLength: 1200 },
  "history.partnership.point3": { kind: "text", maxLength: 1200 },
  "history.downloads.title": { kind: "text", maxLength: 180 },
  "history.downloads.body": { kind: "text", maxLength: 240 },
  "history.downloads.citySupport.label": { kind: "text", maxLength: 180 },
  "history.downloads.citySupport.href": { kind: "href", maxLength: 320 },
  "history.downloads.citySupport.meta": { kind: "text", maxLength: 120 },
  "history.downloads.timeline.label": { kind: "text", maxLength: 180 },
  "history.downloads.timeline.href": { kind: "href", maxLength: 320 },
  "history.downloads.timeline.meta": { kind: "text", maxLength: 120 },
  "history.timeline.title": { kind: "text", maxLength: 180 },
  "history.timeline.body": { kind: "text", maxLength: 1200 },
  "history.timeline.legend.milestone": { kind: "text", maxLength: 120 },
  "history.timeline.legend.management": { kind: "text", maxLength: 120 },
  "history.timeline.legend.funding": { kind: "text", maxLength: 120 },
  "history.timeline.row1.year": { kind: "text", maxLength: 40 },
  "history.timeline.row1.category": { kind: "text", maxLength: 120 },
  "history.timeline.row1.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row2.year": { kind: "text", maxLength: 40 },
  "history.timeline.row2.category": { kind: "text", maxLength: 120 },
  "history.timeline.row2.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row3.year": { kind: "text", maxLength: 40 },
  "history.timeline.row3.category": { kind: "text", maxLength: 120 },
  "history.timeline.row3.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row4.year": { kind: "text", maxLength: 40 },
  "history.timeline.row4.category": { kind: "text", maxLength: 120 },
  "history.timeline.row4.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row5.year": { kind: "text", maxLength: 40 },
  "history.timeline.row5.category": { kind: "text", maxLength: 120 },
  "history.timeline.row5.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row6.year": { kind: "text", maxLength: 40 },
  "history.timeline.row6.category": { kind: "text", maxLength: 120 },
  "history.timeline.row6.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row7.year": { kind: "text", maxLength: 40 },
  "history.timeline.row7.category": { kind: "text", maxLength: 120 },
  "history.timeline.row7.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row8.year": { kind: "text", maxLength: 40 },
  "history.timeline.row8.category": { kind: "text", maxLength: 120 },
  "history.timeline.row8.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row9.year": { kind: "text", maxLength: 40 },
  "history.timeline.row9.category": { kind: "text", maxLength: 120 },
  "history.timeline.row9.text": { kind: "text", maxLength: 1200 },
  "history.timeline.row10.year": { kind: "text", maxLength: 40 },
  "history.timeline.row10.category": { kind: "text", maxLength: 120 },
  "history.timeline.row10.text": { kind: "text", maxLength: 1200 },
  "history.gallery.title": { kind: "text", maxLength: 180 },
  "history.gallery.outdoorPool.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.outdoorPool.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.outdoorPool.caption": { kind: "text", maxLength: 500 },
  "history.gallery.warrenDaugherty.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.warrenDaugherty.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.warrenDaugherty.caption": { kind: "text", maxLength: 500 },
  "history.gallery.renovatedPool.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.renovatedPool.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.renovatedPool.caption": { kind: "text", maxLength: 500 },
  "history.gallery.coachBudTaylor.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.coachBudTaylor.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.coachBudTaylor.caption": { kind: "text", maxLength: 500 },
  "history.gallery.adultFitness.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.adultFitness.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.adultFitness.caption": { kind: "text", maxLength: 500 },
  "history.gallery.learnToSwim.image.src": { kind: "asset", maxLength: 500 },
  "history.gallery.learnToSwim.image.alt": { kind: "text", maxLength: 240 },
  "history.gallery.learnToSwim.caption": { kind: "text", maxLength: 500 },
  "history.cta.subscribe.eyebrow": { kind: "text", maxLength: 120 },
  "history.cta.subscribe.title": { kind: "text", maxLength: 160 },
  "history.cta.subscribe.body": { kind: "text", maxLength: 800 },
  "history.cta.subscribe.label": { kind: "text", maxLength: 80 },
  "history.cta.subscribe.href": { kind: "href", maxLength: 320 },
  "history.cta.contact.eyebrow": { kind: "text", maxLength: 120 },
  "history.cta.contact.title": { kind: "text", maxLength: 160 },
  "history.cta.contact.body": { kind: "text", maxLength: 800 },
  "history.cta.contact.label": { kind: "text", maxLength: 80 },
  "docs.hero.eyebrow": { kind: "text", maxLength: 120 },
  "docs.hero.title": { kind: "text", maxLength: 180 },
  "docs.hero.lead": { kind: "text", maxLength: 1200 },
  "docs.notes.title": { kind: "text", maxLength: 120 },
  "docs.notes.point1": { kind: "text", maxLength: 800 },
  "docs.notes.point2": { kind: "text", maxLength: 800 },
  "docs.notes.point3": { kind: "text", maxLength: 800 },
  "docs.access.title": { kind: "text", maxLength: 160 },
  "docs.access.body": { kind: "text", maxLength: 1000 },
  "docs.access.primaryCta.label": { kind: "text", maxLength: 80 },
  "docs.access.primaryCta.href": { kind: "href", maxLength: 320 },
  "docs.access.secondaryCta.label": { kind: "text", maxLength: 80 },
  "docs.access.secondaryCta.href": { kind: "href", maxLength: 320 },
  "docs.highlights.onlineForms.title": { kind: "text", maxLength: 160 },
  "docs.highlights.onlineForms.body": { kind: "text", maxLength: 240 },
  "docs.highlights.fillablePdfs.title": { kind: "text", maxLength: 160 },
  "docs.highlights.fillablePdfs.body": { kind: "text", maxLength: 240 },
  "docs.highlights.supportingDocs.title": { kind: "text", maxLength: 160 },
  "docs.highlights.supportingDocs.body": { kind: "text", maxLength: 240 },
  "docs.highlights.accessibility.title": { kind: "text", maxLength: 160 },
  "docs.highlights.accessibility.body": { kind: "text", maxLength: 240 },
  "docs.library.forms.title": { kind: "text", maxLength: 120 },
  "docs.library.forms.membershipOnline.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.membershipOnline.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.membershipOnline.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.membershipPdf.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.membershipPdf.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.membershipPdf.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.donationOnline.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.donationOnline.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.donationOnline.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.donationPdf.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.donationPdf.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.donationPdf.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.shirtPdf.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.shirtPdf.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.shirtPdf.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.legacyPdf.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.legacyPdf.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.legacyPdf.meta": { kind: "text", maxLength: 120 },
  "docs.library.forms.photoReleasePdf.label": { kind: "text", maxLength: 180 },
  "docs.library.forms.photoReleasePdf.href": { kind: "href", maxLength: 320 },
  "docs.library.forms.photoReleasePdf.meta": { kind: "text", maxLength: 120 },
  "docs.library.supporting.title": { kind: "text", maxLength: 160 },
  "docs.library.supporting.testimonials.label": { kind: "text", maxLength: 180 },
  "docs.library.supporting.testimonials.href": { kind: "href", maxLength: 320 },
  "docs.library.supporting.testimonials.meta": { kind: "text", maxLength: 120 },
  "docs.library.supporting.cityFundingGraph.label": { kind: "text", maxLength: 180 },
  "docs.library.supporting.cityFundingGraph.href": { kind: "href", maxLength: 320 },
  "docs.library.supporting.cityFundingGraph.meta": { kind: "text", maxLength: 120 },
  "docs.library.supporting.historicTimeline.label": { kind: "text", maxLength: 180 },
  "docs.library.supporting.historicTimeline.href": { kind: "href", maxLength: 320 },
  "docs.library.supporting.historicTimeline.meta": { kind: "text", maxLength: 120 },
  "docs.library.supporting.bybTimeline.label": { kind: "text", maxLength: 180 },
  "docs.library.supporting.bybTimeline.href": { kind: "href", maxLength: 320 },
  "docs.library.supporting.bybTimeline.meta": { kind: "text", maxLength: 120 },
  "docs.library.supporting.chronicleArticle.label": { kind: "text", maxLength: 180 },
  "docs.library.supporting.chronicleArticle.href": { kind: "href", maxLength: 320 },
  "docs.library.supporting.chronicleArticle.meta": { kind: "text", maxLength: 120 },
  "docs.utility.contact.title": { kind: "text", maxLength: 160 },
  "docs.utility.contact.body": { kind: "text", maxLength: 800 },
  "docs.utility.contact.label": { kind: "text", maxLength: 80 },
  "docs.utility.contact.note": { kind: "text", maxLength: 120 },
  "docs.utility.involved.title": { kind: "text", maxLength: 160 },
  "docs.utility.involved.body": { kind: "text", maxLength: 800 },
  "docs.utility.involved.label": { kind: "text", maxLength: 80 },
  "docs.utility.involved.href": { kind: "href", maxLength: 320 },
  "docs.utility.subscribe.title": { kind: "text", maxLength: 160 },
  "docs.utility.subscribe.body": { kind: "text", maxLength: 800 },
  "docs.utility.subscribe.label": { kind: "text", maxLength: 80 },
  "docs.utility.subscribe.href": { kind: "href", maxLength: 320 },
  "news.hero.eyebrow": { kind: "text", maxLength: 120 },
  "news.hero.title": { kind: "text", maxLength: 180 },
  "news.hero.lead": { kind: "text", maxLength: 1200 },
  "news.summary.kicker": { kind: "text", maxLength: 120 },
  "news.summary.title": { kind: "text", maxLength: 240 },
  "news.summary.chip1": { kind: "text", maxLength: 120 },
  "news.summary.chip2": { kind: "text", maxLength: 120 },
  "news.summary.chip3": { kind: "text", maxLength: 120 },
  "news.updates.title": { kind: "text", maxLength: 160 },
  "news.updates.item1.date": { kind: "text", maxLength: 80 },
  "news.updates.item1.tag": { kind: "text", maxLength: 120 },
  "news.updates.item1.title": { kind: "text", maxLength: 180 },
  "news.updates.item1.body": { kind: "text", maxLength: 1200 },
  "news.updates.item2.date": { kind: "text", maxLength: 80 },
  "news.updates.item2.tag": { kind: "text", maxLength: 120 },
  "news.updates.item2.title": { kind: "text", maxLength: 180 },
  "news.updates.item2.body": { kind: "text", maxLength: 1200 },
  "news.updates.item3.date": { kind: "text", maxLength: 80 },
  "news.updates.item3.tag": { kind: "text", maxLength: 120 },
  "news.updates.item3.title": { kind: "text", maxLength: 180 },
  "news.updates.item3.body": { kind: "text", maxLength: 1200 },
  "news.updates.item4.date": { kind: "text", maxLength: 80 },
  "news.updates.item4.tag": { kind: "text", maxLength: 120 },
  "news.updates.item4.title": { kind: "text", maxLength: 180 },
  "news.updates.item4.body": { kind: "text", maxLength: 1200 },
  "news.updates.item5.date": { kind: "text", maxLength: 80 },
  "news.updates.item5.tag": { kind: "text", maxLength: 120 },
  "news.updates.item5.title": { kind: "text", maxLength: 180 },
  "news.updates.item5.body": { kind: "text", maxLength: 1200 },
  "news.updates.item6.date": { kind: "text", maxLength: 80 },
  "news.updates.item6.tag": { kind: "text", maxLength: 120 },
  "news.updates.item6.title": { kind: "text", maxLength: 180 },
  "news.updates.item6.body": { kind: "text", maxLength: 1200 },
  "news.updates.item7.date": { kind: "text", maxLength: 80 },
  "news.updates.item7.tag": { kind: "text", maxLength: 120 },
  "news.updates.item7.title": { kind: "text", maxLength: 180 },
  "news.updates.item7.body": { kind: "text", maxLength: 1200 },
  "news.updates.item8.date": { kind: "text", maxLength: 80 },
  "news.updates.item8.tag": { kind: "text", maxLength: 120 },
  "news.updates.item8.title": { kind: "text", maxLength: 180 },
  "news.updates.item8.body": { kind: "text", maxLength: 1200 },
  "news.updates.item9.date": { kind: "text", maxLength: 80 },
  "news.updates.item9.tag": { kind: "text", maxLength: 120 },
  "news.updates.item9.title": { kind: "text", maxLength: 180 },
  "news.updates.item9.body": { kind: "text", maxLength: 1200 },
  "news.updates.item10.date": { kind: "text", maxLength: 80 },
  "news.updates.item10.tag": { kind: "text", maxLength: 120 },
  "news.updates.item10.title": { kind: "text", maxLength: 180 },
  "news.updates.item10.body": { kind: "text", maxLength: 1200 },
  "news.updates.item11.date": { kind: "text", maxLength: 80 },
  "news.updates.item11.tag": { kind: "text", maxLength: 120 },
  "news.updates.item11.title": { kind: "text", maxLength: 180 },
  "news.updates.item11.body": { kind: "text", maxLength: 1200 },
  "news.photos.title": { kind: "text", maxLength: 180 },
  "news.photos.link.label": { kind: "text", maxLength: 120 },
  "news.photos.link.href": { kind: "href", maxLength: 320 },
  "news.photos.item1.image.src": { kind: "asset", maxLength: 500 },
  "news.photos.item1.image.alt": { kind: "text", maxLength: 240 },
  "news.photos.item1.captionTitle": { kind: "text", maxLength: 160 },
  "news.photos.item1.captionCredit": { kind: "text", maxLength: 240 },
  "news.photos.item2.image.src": { kind: "asset", maxLength: 500 },
  "news.photos.item2.image.alt": { kind: "text", maxLength: 240 },
  "news.photos.item2.captionTitle": { kind: "text", maxLength: 160 },
  "news.photos.item2.captionCredit": { kind: "text", maxLength: 240 },
  "news.photos.item3.image.src": { kind: "asset", maxLength: 500 },
  "news.photos.item3.image.alt": { kind: "text", maxLength: 240 },
  "news.photos.item3.captionTitle": { kind: "text", maxLength: 160 },
  "news.photos.item3.captionCredit": { kind: "text", maxLength: 240 },
  "news.photos.item4.image.src": { kind: "asset", maxLength: 500 },
  "news.photos.item4.image.alt": { kind: "text", maxLength: 240 },
  "news.photos.item4.captionTitle": { kind: "text", maxLength: 160 },
  "news.photos.item4.captionCredit": { kind: "text", maxLength: 240 },
  "news.utility.contact.title": { kind: "text", maxLength: 120 },
  "news.utility.contact.body": { kind: "text", maxLength: 800 },
  "news.utility.contact.label": { kind: "text", maxLength: 80 },
  "news.utility.docs.title": { kind: "text", maxLength: 120 },
  "news.utility.docs.body": { kind: "text", maxLength: 800 },
  "news.utility.docs.label": { kind: "text", maxLength: 80 },
  "news.utility.docs.href": { kind: "href", maxLength: 320 },
  "news.utility.donate.title": { kind: "text", maxLength: 120 },
  "news.utility.donate.body": { kind: "text", maxLength: 800 },
  "news.utility.donate.label": { kind: "text", maxLength: 80 },
  "news.utility.donate.href": { kind: "href", maxLength: 320 }
};

const getCorsHeaders = (origin) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization"
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
};

const json = (payload, status, origin) => {
  return new Response(JSON.stringify(payload), {
    status,
    headers: getCorsHeaders(origin)
  });
};

const getAllowedOrigin = (request, env) => {
  const origin = request.headers.get("Origin") || "";
  if (
    origin.startsWith("http://localhost") ||
    origin.startsWith("http://127.0.0.1") ||
    origin.endsWith(".pages.dev")
  ) {
    return origin;
  }
  const allowed = (env.ALLOWED_ORIGIN || "*").split(",").map((value) => value.trim());
  if (allowed.includes("*")) {
    return "*";
  }
  if (allowed.includes(origin)) {
    return origin;
  }
  return "";
};

const isValidEmail = (email) => {
  if (!email || email.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const sanitizeText = (value, maxLength = 1000) => {
  return String(value || "").trim().slice(0, maxLength);
};

const sanitizeSecretText = (value, maxLength = 1000) => {
  return String(value || "").slice(0, maxLength);
};

const isSafeRelativePath = (value) => {
  const text = sanitizeText(value, 600);
  if (!text || text.startsWith("//")) return false;
  return !/^[a-z][a-z0-9+.-]*:/i.test(text);
};

const isSafeHrefValue = (value) => {
  const href = sanitizeText(value, 600);
  if (!href) return false;
  if (/^(https?:|mailto:|tel:|#)/i.test(href)) return true;
  if (href.startsWith("/") || href.startsWith("./") || href.startsWith("../")) return true;
  return isSafeRelativePath(href);
};

const isSafeAssetSrcValue = (value) => {
  const src = sanitizeText(value, 600);
  if (!src) return false;
  if (/^https?:\/\//i.test(src)) return true;
  if (src.startsWith("/") || src.startsWith("./") || src.startsWith("../")) return true;
  return isSafeRelativePath(src);
};

const normalizeAdminEmail = (value) => {
  return sanitizeText(value, 254).toLowerCase();
};

const getAdminEmailCandidates = (value) => {
  const primary = normalizeAdminEmail(value);
  if (!isValidEmail(primary)) {
    return [];
  }
  const aliases = Array.isArray(ADMIN_EMAIL_ALIAS_MAP[primary]) ? ADMIN_EMAIL_ALIAS_MAP[primary] : [];
  return uniqueValues([primary, ...aliases.map((entry) => normalizeAdminEmail(entry)).filter((entry) => isValidEmail(entry))]);
};

const normalizeEmail = (value) => {
  return sanitizeText(value, 254).toLowerCase();
};

const normalizePhone = (value) => {
  return sanitizeText(value, 64).replace(/[^\d+]/g, "");
};

const uniqueValues = (values) => {
  return Array.from(new Set((values || []).filter(Boolean)));
};

const createRecordId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const toIsoDateOnly = (value) => {
  const text = sanitizeText(value, 100);
  if (!text) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const toBoolean = (value) => {
  if (typeof value === "boolean") return value;
  const text = sanitizeText(value, 20).toLowerCase();
  if (!text) return false;
  return ["1", "true", "yes", "y", "on"].includes(text);
};

const getAllowedAdminEmails = (env) => {
  const configured = sanitizeText(env.ADMIN_ALLOWED_EMAILS, 1000);
  const source = configured ? configured.split(",") : DEFAULT_ALLOWED_ADMIN_EMAILS;

  return Array.from(
    new Set(
      source
        .map((value) => normalizeAdminEmail(value))
        .filter((value) => isValidEmail(value))
    )
  );
};

const isAllowedAdminEmail = (env, email) => {
  const allowed = getAllowedAdminEmails(env);
  return getAdminEmailCandidates(email).some((candidate) => allowed.includes(candidate));
};

const escapeHtml = (value) => {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const textToHtml = (value) => {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
};

const toBase64Url = (value) => {
  const bytes = value instanceof Uint8Array ? value : textEncoder.encode(String(value));
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(normalized + padding);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const timingSafeEqual = (left, right) => {
  const leftBytes = left instanceof Uint8Array ? left : textEncoder.encode(String(left));
  const rightBytes = right instanceof Uint8Array ? right : textEncoder.encode(String(right));

  let mismatch = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }
  return mismatch === 0;
};

const getRandomBytes = (length) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

const importHmacKey = async (secret) => {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
};

const importPasswordKey = async (password) => {
  return crypto.subtle.importKey(
    "raw",
    textEncoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
};

const derivePasswordHash = async (password, salt, iterations) => {
  const key = await importPasswordKey(password);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256"
    },
    key,
    ADMIN_PASSWORD_HASH_BYTES * 8
  );
  return new Uint8Array(bits);
};

const createPasswordHashRecord = async (password) => {
  const salt = getRandomBytes(ADMIN_SALT_BYTES);
  const hash = await derivePasswordHash(password, salt, ADMIN_PASSWORD_ITERATIONS);

  return {
    algorithm: "PBKDF2-SHA256",
    iterations: ADMIN_PASSWORD_ITERATIONS,
    salt: toBase64Url(salt),
    hash: toBase64Url(hash)
  };
};

const verifyPasswordHash = async (password, record) => {
  if (!record || record.algorithm !== "PBKDF2-SHA256") {
    return false;
  }

  try {
    const salt = fromBase64Url(record.salt);
    const expectedHash = fromBase64Url(record.hash);
    const derivedHash = await derivePasswordHash(password, salt, Number(record.iterations) || ADMIN_PASSWORD_ITERATIONS);
    return timingSafeEqual(derivedHash, expectedHash);
  } catch (error) {
    return false;
  }
};

const validateAdminPassword = (password) => {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < ADMIN_MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${ADMIN_MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password.length > 512) {
    return "Password is too long.";
  }
  return "";
};

const getAdminSigningSecret = (env) => {
  return sanitizeText(env.ADMIN_SESSION_SECRET || env.ADMIN_PASSPHRASE, 512);
};

const getAdminResetSecret = (env) => {
  const baseSecret = sanitizeText(env.ADMIN_RESET_SECRET || env.ADMIN_SESSION_SECRET || env.ADMIN_PASSPHRASE, 512);
  if (!baseSecret) {
    return "";
  }
  return `${baseSecret}:admin-reset`;
};

const getAdminUserKey = (email) => {
  return `${ADMIN_USER_PREFIX}${email}`;
};

const getAdminResetKey = (tokenId) => {
  return `${ADMIN_RESET_PREFIX}${tokenId}`;
};

const getAdminPersonKey = (personId) => {
  return `${ADMIN_PERSON_PREFIX}${personId}`;
};

const getAdminMemberKey = (memberId) => {
  return `${ADMIN_MEMBER_PREFIX}${memberId}`;
};

const getAdminDonorKey = (donorId) => {
  return `${ADMIN_DONOR_PREFIX}${donorId}`;
};

const getAdminImportKey = (importId) => {
  return `${ADMIN_IMPORT_PREFIX}${importId}`;
};

const getAdminContentKey = (phase, page) => {
  return `${ADMIN_CONTENT_PREFIX}${phase}:${page}`;
};

const getAdminInboxKey = (sourceRecordId) => {
  return `${ADMIN_INBOX_PREFIX}${toBase64Url(sourceRecordId)}`;
};

const getAdminZohoOauthStateKey = (nonce) => {
  return `${ADMIN_ZOHO_OAUTH_STATE_PREFIX}${nonce}`;
};

const getAdminAuditLogKey = (id) => {
  return `${ADMIN_AUDIT_LOG_PREFIX}${id}`;
};

const getAdminPasswordTimestamp = (user) => {
  return sanitizeText(user?.passwordUpdatedAt || user?.updatedAt || user?.createdAt, 64);
};

const getAdminRole = (user) => {
  const role = sanitizeText(user?.role, 40).toLowerCase();
  return role || "admin";
};

const adminHasRole = (user, allowedRoles = []) => {
  if (!allowedRoles.length) return true;
  return allowedRoles.includes(getAdminRole(user));
};

const getZohoAccountsBaseUrl = (env) => {
  const configured = sanitizeText(env.ZOHO_ACCOUNTS_BASE_URL, 500).replace(/\/+$/, "");
  if (/^https?:\/\//i.test(configured)) return configured;
  return "https://accounts.zoho.com";
};

const getZohoMailBaseUrl = (env) => {
  const configured = sanitizeText(env.ZOHO_MAIL_BASE_URL, 500).replace(/\/+$/, "");
  if (/^https?:\/\//i.test(configured)) return configured;
  return "https://mail.zoho.com";
};

const getZohoClientId = (env) => sanitizeSecretText(env.ZOHO_CLIENT_ID, 500);
const getZohoClientSecret = (env) => sanitizeSecretText(env.ZOHO_CLIENT_SECRET, 500);
const getZohoMailAccountId = (env) => sanitizeText(env.ZOHO_MAIL_ACCOUNT_ID, 200);
const getZohoFromAddress = (env) => sanitizeText(env.ZOHO_FROM_EMAIL || env.CONTACT_FORM_FROM_EMAIL, 254);
const getZohoTokenEncryptionSecret = (env) =>
  sanitizeSecretText(env.ZOHO_TOKEN_ENCRYPTION_KEY || env.ADMIN_SESSION_SECRET || env.ADMIN_PASSPHRASE, 1024);
const getZohoScope = (env) =>
  sanitizeText(
    env.ZOHO_OAUTH_SCOPE ||
      "ZohoMail.accounts.READ,ZohoMail.folders.READ,ZohoMail.messages.READ,ZohoMail.messages.CREATE,ZohoMail.messages.UPDATE",
    1000
  );

const getZohoRedirectUri = (env, origin) => {
  // Prefer the live browser origin when available so OAuth follows whichever
  // approved admin domain is actively in use (with or without www).
  const originBase =
    origin && origin !== "*" && origin !== "null" && /^https?:\/\//.test(origin)
      ? origin.replace(/\/+$/, "")
      : "";
  const siteBase = getAdminSiteUrl(env, origin);
  return `${originBase || siteBase}/admin/mail/callback`;
};

const DEFAULT_ZOHO_ADMIN_RETURN_PATH = "/admin/index.html#admin-newsletter-panel";

const normalizeZohoAdminReturnPath = (value) => {
  const raw = sanitizeText(value, 800);
  if (!raw) return DEFAULT_ZOHO_ADMIN_RETURN_PATH;

  try {
    const parsed = new URL(raw, "https://friendsofwdac.org");
    const pathName = sanitizeText(parsed.pathname, 400).replace(/\/+$/, "") || "/admin/index.html";
    if (!pathName.startsWith("/admin/")) {
      return DEFAULT_ZOHO_ADMIN_RETURN_PATH;
    }

    const query = sanitizeText(parsed.search, 300);
    const hash = sanitizeText(parsed.hash, 200);
    return `${pathName}${query}${hash}`;
  } catch (error) {
    return DEFAULT_ZOHO_ADMIN_RETURN_PATH;
  }
};

const buildZohoAdminReturnUrl = (env, origin, state, message = "", returnPath = "") => {
  const targetPath = normalizeZohoAdminReturnPath(returnPath);
  const url = new URL(`${getAdminSiteUrl(env, origin)}${targetPath}`);
  if (state) {
    url.searchParams.set("zoho", sanitizeText(state, 40));
  }
  if (message) {
    url.searchParams.set("zoho_message", sanitizeText(message, 300));
  }
  return url.toString();
};

const hasZohoCoreConfig = (env) => {
  return Boolean(getZohoClientId(env) && getZohoClientSecret(env) && getZohoTokenEncryptionSecret(env));
};

const importAesGcmKey = async (secret) => {
  const digest = await crypto.subtle.digest("SHA-256", textEncoder.encode(secret));
  return crypto.subtle.importKey("raw", digest, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
};

const encryptSecretValue = async (plainText, secret) => {
  if (!secret) throw new Error("Missing encryption secret");
  const iv = getRandomBytes(12);
  const key = await importAesGcmKey(secret);
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    textEncoder.encode(String(plainText || ""))
  );
  return `v1.${toBase64Url(iv)}.${toBase64Url(new Uint8Array(cipher))}`;
};

const decryptSecretValue = async (encryptedValue, secret) => {
  if (!secret) throw new Error("Missing encryption secret");
  const payload = sanitizeSecretText(encryptedValue, 12000);
  const [version, ivSegment, cipherSegment] = payload.split(".", 3);
  if (version !== "v1" || !ivSegment || !cipherSegment) {
    throw new Error("Invalid encrypted payload format");
  }

  const iv = fromBase64Url(ivSegment);
  const cipherBytes = fromBase64Url(cipherSegment);
  const key = await importAesGcmKey(secret);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipherBytes);
  return new TextDecoder().decode(plain);
};

const buildZohoOauthState = async (env, user, origin, returnPath = "") => {
  const signingSecret = getAdminSigningSecret(env);
  if (!signingSecret) {
    throw new Error("Admin session secret is not configured");
  }

  const issuedAt = Date.now();
  const nonce = createRecordId();
  const normalizedReturnPath = normalizeZohoAdminReturnPath(returnPath);
  const payload = {
    scope: "zoho-oauth-state",
    email: normalizeAdminEmail(user?.email),
    role: getAdminRole(user),
    redirectUri: getZohoRedirectUri(env, origin),
    returnPath: normalizedReturnPath,
    nonce,
    iat: issuedAt,
    exp: issuedAt + (ZOHO_OAUTH_STATE_TTL_SECONDS * 1000)
  };

  await env.SUBSCRIBERS.put(
    getAdminZohoOauthStateKey(nonce),
    JSON.stringify({
      email: payload.email,
      redirectUri: payload.redirectUri,
      returnPath: payload.returnPath,
      createdAt: new Date(issuedAt).toISOString(),
      expiresAt: new Date(payload.exp).toISOString()
    }),
    { expirationTtl: ZOHO_OAUTH_STATE_TTL_SECONDS }
  );

  return signJsonToken(signingSecret, payload);
};

const verifyZohoOauthState = async (env, stateToken) => {
  const payload = await verifyJsonToken(sanitizeSecretText(stateToken, 4096), getAdminSigningSecret(env));
  if (!payload) {
    return { error: "Invalid OAuth state." };
  }

  if (payload.scope !== "zoho-oauth-state") {
    return { error: "Invalid OAuth state scope." };
  }

  if (!payload.nonce || !isValidEmail(payload.email)) {
    return { error: "OAuth state is missing required fields." };
  }
  if (!/^https?:\/\//.test(sanitizeText(payload.redirectUri, 600))) {
    return { error: "OAuth state is missing redirect URI context." };
  }
  const rawPayloadReturnPath = sanitizeText(payload.returnPath, 800);
  const normalizedPayloadReturnPath = normalizeZohoAdminReturnPath(rawPayloadReturnPath);
  if (rawPayloadReturnPath && rawPayloadReturnPath !== normalizedPayloadReturnPath) {
    return { error: "OAuth state return path is invalid." };
  }

  if (!payload.exp || Number(payload.exp) <= Date.now()) {
    return { error: "OAuth state has expired." };
  }

  const stateKey = getAdminZohoOauthStateKey(payload.nonce);
  const raw = await env.SUBSCRIBERS.get(stateKey);
  if (!raw) {
    return { error: "OAuth state was not found or already used." };
  }

  await env.SUBSCRIBERS.delete(stateKey);
  let record;
  try {
    record = JSON.parse(raw);
  } catch (error) {
    return { error: "OAuth state record is invalid." };
  }

  if (normalizeAdminEmail(record?.email) !== normalizeAdminEmail(payload.email)) {
    return { error: "OAuth state does not match the initiating admin user." };
  }
  if (sanitizeText(record?.redirectUri, 600) !== sanitizeText(payload.redirectUri, 600)) {
    return { error: "OAuth state redirect URI mismatch." };
  }
  const normalizedRecordReturnPath = normalizeZohoAdminReturnPath(sanitizeText(record?.returnPath, 800));
  if (normalizedRecordReturnPath !== normalizedPayloadReturnPath) {
    return { error: "OAuth state return path mismatch." };
  }

  payload.returnPath = normalizedPayloadReturnPath;

  return { payload };
};

const parseZohoErrorMessage = (payload, fallback) => {
  if (Array.isArray(payload)) {
    const nestedObject = payload.find((entry) => entry && typeof entry === "object");
    if (nestedObject) {
      return parseZohoErrorMessage(nestedObject, fallback);
    }
    return fallback;
  }

  if (!payload || typeof payload !== "object") return fallback;
  const status = payload.status;
  if (typeof status === "string" && status.trim()) return status.trim();
  if (status && typeof status === "object") {
    const message = sanitizeText(status.description || status.message || status.error, 500);
    if (message) return message;
  }
  const message = sanitizeText(
    payload.message ||
      payload.error ||
      payload.description ||
      payload?.data?.moreInfo ||
      payload?.data?.errorCode ||
      payload?.data?.message,
    500
  );
  return message || fallback;
};

const parseZohoAccountsList = (payload) => {
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.accounts)) return payload.accounts;
  if (Array.isArray(payload?.account)) return payload.account;
  return [];
};

const collectZohoEmails = (bucket, value) => {
  if (!value) return;

  if (Array.isArray(value)) {
    for (const entry of value) {
      collectZohoEmails(bucket, entry);
    }
    return;
  }

  if (typeof value === "string") {
    const email = normalizeEmail(value);
    if (isValidEmail(email)) {
      bucket.push(email);
    }
    return;
  }

  if (typeof value === "object") {
    collectZohoEmails(bucket, value.mailId);
    collectZohoEmails(bucket, value.email);
    collectZohoEmails(bucket, value.emailAddress);
    collectZohoEmails(bucket, value.address);
    collectZohoEmails(bucket, value.fromAddress);
    collectZohoEmails(bucket, value.userName);
    collectZohoEmails(bucket, value.incomingUserName);
    collectZohoEmails(bucket, value.mailboxAddress);
    collectZohoEmails(bucket, value.primaryEmailAddress);
  }
};

const getZohoSenderProfile = (accountRecord = {}, env) => {
  const mailboxCandidates = [];
  collectZohoEmails(mailboxCandidates, accountRecord?.mailboxAddress);
  collectZohoEmails(mailboxCandidates, accountRecord?.primaryEmailAddress);
  collectZohoEmails(mailboxCandidates, accountRecord?.incomingUserName);
  collectZohoEmails(mailboxCandidates, accountRecord?.emailAddress);
  collectZohoEmails(mailboxCandidates, accountRecord?.mailAddress);
  const mailboxEmail = uniqueValues(mailboxCandidates)[0] || normalizeEmail(getZohoFromAddress(env));

  const fromCandidates = [];
  collectZohoEmails(fromCandidates, accountRecord?.sendMailDetails);
  collectZohoEmails(fromCandidates, mailboxEmail);
  collectZohoEmails(fromCandidates, accountRecord?.primaryEmailAddress);
  const allowedFromAddresses = uniqueValues(fromCandidates);
  const defaultFromAddress = allowedFromAddresses[0] || mailboxEmail || "";

  return {
    mailboxEmail,
    defaultFromAddress,
    allowedFromAddresses
  };
};

const getZohoAccountEmails = (accountRecord = {}) => {
  const accountEmails = [];
  collectZohoEmails(accountEmails, accountRecord?.mailboxAddress);
  collectZohoEmails(accountEmails, accountRecord?.primaryEmailAddress);
  collectZohoEmails(accountEmails, accountRecord?.incomingUserName);
  collectZohoEmails(accountEmails, accountRecord?.emailAddress);
  collectZohoEmails(accountEmails, accountRecord?.mailAddress);
  collectZohoEmails(accountEmails, accountRecord?.sendMailDetails);
  return uniqueValues(accountEmails);
};

const accountHasZohoEmail = (accountRecord = {}, email = "") => {
  const normalized = normalizeEmail(email);
  if (!isValidEmail(normalized)) return false;
  return getZohoAccountEmails(accountRecord).includes(normalized);
};

const getZohoMailBaseCandidates = (env, tokenPayload = {}) => {
  const tokenMailUrl = sanitizeText(tokenPayload?.mail_url, 500).replace(/\/+$/, "");
  const configuredMailBase = sanitizeText(getZohoMailBaseUrl(env), 500).replace(/\/+$/, "");
  const tokenApiDomain = sanitizeText(tokenPayload?.api_domain, 500).replace(/\/+$/, "");

  return uniqueValues([tokenMailUrl, configuredMailBase, tokenApiDomain]).filter((value) => /^https?:\/\//i.test(value));
};

const loadZohoAccountsWithFallback = async (env, tokenPayload, accessToken) => {
  const candidates = getZohoMailBaseCandidates(env, tokenPayload);
  let lastError = null;

  for (const baseUrl of candidates) {
    try {
      const payload = await callZohoApi(`${baseUrl}/api/accounts`, accessToken);
      return { payload, mailBaseUrl: baseUrl };
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Unable to load Zoho accounts from the configured mail endpoints.");
};

const resolveZohoFromAddress = (env, connection) => {
  const configured = normalizeEmail(getZohoFromAddress(env));
  const allowed = uniqueValues(
    (Array.isArray(connection?.allowedFromAddresses) ? connection.allowedFromAddresses : [])
      .map((value) => normalizeEmail(value))
      .filter((value) => isValidEmail(value))
  );

  if (configured && allowed.includes(configured)) {
    return configured;
  }

  const defaultFrom = normalizeEmail(connection?.defaultFromAddress);
  if (defaultFrom && isValidEmail(defaultFrom)) {
    return defaultFrom;
  }

  const mailbox = normalizeEmail(connection?.mailboxEmail);
  if (mailbox && isValidEmail(mailbox)) {
    return mailbox;
  }

  return configured;
};

const resolveZohoAccountRecord = (accounts = [], preferredAccountId = "", preferredEmail = "") => {
  if (!accounts.length) return null;
  const preferred = sanitizeText(preferredAccountId, 200);
  if (preferred) {
    const matched = accounts.find((account) => sanitizeText(account?.accountId || account?.id, 200) === preferred);
    if (matched) return matched;
  }
  const preferredFrom = normalizeEmail(preferredEmail);
  if (isValidEmail(preferredFrom)) {
    const matchedByEmail = accounts.find((account) => accountHasZohoEmail(account, preferredFrom));
    if (matchedByEmail) return matchedByEmail;
  }
  return accounts[0] || null;
};

const loadZohoConnection = async (env) => {
  return loadJsonRecord(env, ADMIN_ZOHO_CONNECTION_KEY);
};

const saveZohoConnection = async (env, record) => {
  await saveJsonRecord(env, ADMIN_ZOHO_CONNECTION_KEY, record);
};

const writeAuditLog = async (env, user, action, metadata = {}) => {
  const id = `${Date.now()}:${createRecordId()}`;
  const record = {
    id,
    type: "audit-log",
    action: sanitizeText(action, 120),
    userEmail: sanitizeText(user?.email, 254),
    userRole: getAdminRole(user),
    metadata,
    createdAt: new Date().toISOString()
  };
  await saveJsonRecord(env, getAdminAuditLogKey(id), record);
};

const buildZohoAuthorizeUrl = (env, origin, state) => {
  const url = new URL(`${getZohoAccountsBaseUrl(env)}/oauth/v2/auth`);
  url.searchParams.set("scope", getZohoScope(env));
  url.searchParams.set("client_id", getZohoClientId(env));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("redirect_uri", getZohoRedirectUri(env, origin));
  url.searchParams.set("state", state);
  return url.toString();
};

const requestZohoToken = async (env, origin, params, redirectUriOverride = "") => {
  const redirectUri = sanitizeText(redirectUriOverride, 600) || getZohoRedirectUri(env, origin);
  const body = new URLSearchParams({
    client_id: getZohoClientId(env),
    client_secret: getZohoClientSecret(env),
    redirect_uri: redirectUri,
    ...params
  });

  const response = await fetch(`${getZohoAccountsBaseUrl(env)}/oauth/v2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const message = parseZohoErrorMessage(payload, "Zoho token exchange failed.");
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const callZohoApi = async (url, accessToken, options = {}) => {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Zoho-oauthtoken ${accessToken}`,
      ...(options.headers || {})
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = parseZohoErrorMessage(payload, `Zoho API request failed (${response.status}).`);
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};

const buildZohoConnectionRecord = async (
  env,
  tokenPayload,
  origin,
  accountRecord,
  user,
  redirectUriOverride = "",
  mailBaseUrlOverride = ""
) => {
  const now = new Date().toISOString();
  const refreshToken = sanitizeSecretText(tokenPayload?.refresh_token, 4000);
  if (!refreshToken) {
    throw new Error("Zoho did not return a refresh token. Reconnect and ensure access_type=offline.");
  }

  const encryptionSecret = getZohoTokenEncryptionSecret(env);
  const encryptedRefreshToken = await encryptSecretValue(refreshToken, encryptionSecret);
  const expiresInSeconds = Number(tokenPayload?.expires_in || tokenPayload?.expires_in_sec || 3600);
  const accessTokenExpiresAt = new Date(Date.now() + (Math.max(60, expiresInSeconds) * 1000)).toISOString();
  const accountId = sanitizeText(accountRecord?.accountId || accountRecord?.id, 200);
  const senderProfile = getZohoSenderProfile(accountRecord, env);
  const mailBaseUrl =
    sanitizeText(mailBaseUrlOverride, 500).replace(/\/+$/, "") ||
    sanitizeText(tokenPayload?.mail_url, 500).replace(/\/+$/, "") ||
    getZohoMailBaseUrl(env);
  const redirectUri = sanitizeText(redirectUriOverride, 600) || getZohoRedirectUri(env, origin);

  return {
    id: "primary",
    type: "zoho-connection",
    status: "connected",
    accountId,
    mailboxEmail: senderProfile.mailboxEmail,
    defaultFromAddress: senderProfile.defaultFromAddress,
    allowedFromAddresses: senderProfile.allowedFromAddresses,
    zohoLocation: sanitizeText(tokenPayload?.location, 80),
    scope: sanitizeText(tokenPayload?.scope || getZohoScope(env), 1000),
    accountsBaseUrl: getZohoAccountsBaseUrl(env),
    mailBaseUrl,
    redirectUri,
    encryptedRefreshToken,
    accessTokenCache: sanitizeSecretText(tokenPayload?.access_token, 4000),
    accessTokenExpiresAt,
    createdBy: sanitizeText(user?.email, 254),
    createdAt: now,
    updatedAt: now
  };
};

const refreshZohoAccessToken = async (env, connection, origin) => {
  const encryptionSecret = getZohoTokenEncryptionSecret(env);
  const refreshToken = await decryptSecretValue(connection?.encryptedRefreshToken, encryptionSecret);
  const redirectUri = sanitizeText(connection?.redirectUri, 600);
  const tokenPayload = await requestZohoToken(env, origin, {
    grant_type: "refresh_token",
    refresh_token: refreshToken
  }, redirectUri);

  const expiresInSeconds = Number(tokenPayload?.expires_in || tokenPayload?.expires_in_sec || 3600);
  const nextConnection = {
    ...connection,
    accessTokenCache: sanitizeSecretText(tokenPayload?.access_token, 4000),
    accessTokenExpiresAt: new Date(Date.now() + (Math.max(60, expiresInSeconds) * 1000)).toISOString(),
    updatedAt: new Date().toISOString()
  };
  if (redirectUri) {
    nextConnection.redirectUri = redirectUri;
  }

  if (sanitizeText(tokenPayload?.mail_url, 500)) {
    nextConnection.mailBaseUrl = sanitizeText(tokenPayload.mail_url, 500).replace(/\/+$/, "");
  }

  await saveZohoConnection(env, nextConnection);
  return nextConnection;
};

const ensureZohoAccessToken = async (env, connection, origin, forceRefresh = false) => {
  if (!connection || connection.status !== "connected") {
    throw new Error("Zoho is not connected.");
  }

  const expiresAt = Date.parse(connection.accessTokenExpiresAt || "");
  const cachedToken = sanitizeSecretText(connection.accessTokenCache, 4000);
  const isTokenFresh =
    !forceRefresh &&
    cachedToken &&
    Number.isFinite(expiresAt) &&
    (expiresAt - ZOHO_ACCESS_TOKEN_SKEW_MS) > Date.now();

  if (isTokenFresh) {
    return { accessToken: cachedToken, connection };
  }

  const refreshedConnection = await refreshZohoAccessToken(env, connection, origin);
  return {
    accessToken: sanitizeSecretText(refreshedConnection.accessTokenCache, 4000),
    connection: refreshedConnection
  };
};

const ensureZohoSenderProfile = async (env, connection, origin) => {
  const configuredFrom = normalizeEmail(getZohoFromAddress(env));
  const allowedFrom = Array.isArray(connection?.allowedFromAddresses)
    ? connection.allowedFromAddresses
      .map((value) => normalizeEmail(value))
      .filter((value) => isValidEmail(value))
    : [];

  const hasMailbox = isValidEmail(normalizeEmail(connection?.mailboxEmail));
  const hasDefaultFrom = isValidEmail(normalizeEmail(connection?.defaultFromAddress));
  const hasAllowedFrom = allowedFrom.length > 0;
  const hasConfiguredFrom = isValidEmail(configuredFrom);
  const configuredFromAvailable = !hasConfiguredFrom || allowedFrom.includes(configuredFrom);

  if (hasMailbox && hasDefaultFrom && hasAllowedFrom && configuredFromAvailable) {
    return connection;
  }

  const accountId = sanitizeText(connection?.accountId, 200);
  if (!accountId) {
    return connection;
  }

  try {
    const accountResult = await requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
      const route = `${sanitizeText(activeConnection.mailBaseUrl, 500).replace(/\/+$/, "")}/api/accounts/${encodeURIComponent(accountId)}`;
      return callZohoApi(route, accessToken);
    });

    const accountRecord = accountResult?.payload?.data || accountResult?.payload || {};
    const profile = getZohoSenderProfile(accountRecord, env);
    const nextConnection = {
      ...accountResult.connection,
      mailboxEmail: profile.mailboxEmail,
      defaultFromAddress: profile.defaultFromAddress,
      allowedFromAddresses: profile.allowedFromAddresses,
      updatedAt: new Date().toISOString()
    };
    await saveZohoConnection(env, nextConnection);
    return nextConnection;
  } catch (error) {
    return connection;
  }
};

const requestZohoWithRefresh = async (env, connection, origin, requestFactory) => {
  let activeConnection = connection;
  let credentials = await ensureZohoAccessToken(env, activeConnection, origin, false);

  try {
    const payload = await requestFactory(credentials.accessToken, credentials.connection);
    return { payload, connection: credentials.connection };
  } catch (error) {
    if (Number(error?.status) !== 401) {
      throw error;
    }

    credentials = await ensureZohoAccessToken(env, credentials.connection, origin, true);
    const payload = await requestFactory(credentials.accessToken, credentials.connection);
    return { payload, connection: credentials.connection };
  }
};

const normalizeContentPage = (value) => {
  return sanitizeText(value, 60).toLowerCase();
};

const getContentPagePhase = (value) => {
  const page = normalizeContentPage(value);
  if (!Object.prototype.hasOwnProperty.call(CONTENT_PAGE_PHASES, page)) {
    return null;
  }
  return CONTENT_PAGE_PHASES[page];
};

const isSupportedContentPage = (value) => {
  return getContentPagePhase(value) !== null;
};

const parseContentPhase = (value) => {
  const phase = Number.parseInt(String(value || "1"), 10);
  if (!Number.isFinite(phase)) return null;
  return phase;
};

const resolveContentPhase = (value, page) => {
  const expectedPhase = getContentPagePhase(page);
  if (!expectedPhase) {
    return { error: "Content page not found." };
  }

  if (value === undefined || value === null || value === "") {
    return { phase: expectedPhase };
  }

  const phase = parseContentPhase(value);
  if (phase === null) {
    return { error: "Invalid content phase." };
  }

  if (phase !== expectedPhase) {
    return { error: `Content page ${page} is available in phase=${expectedPhase}.` };
  }

  return { phase };
};

const isPlainObject = (value) => {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
};

const setNestedValue = (target, path, value) => {
  const segments = path.split(".");
  let cursor = target;

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const isLeaf = index === segments.length - 1;
    if (isLeaf) {
      cursor[segment] = value;
      return;
    }

    if (!isPlainObject(cursor[segment])) {
      cursor[segment] = {};
    }
    cursor = cursor[segment];
  }
};

const listContentLeafEntries = (value, prefix = "", output = []) => {
  if (!isPlainObject(value)) {
    return { error: "Content payload must be an object." };
  }

  for (const [rawKey, rawValue] of Object.entries(value)) {
    const key = sanitizeText(rawKey, 80);
    if (!key) {
      return { error: "Content payload has an invalid field key." };
    }

    const path = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(rawValue)) {
      const nested = listContentLeafEntries(rawValue, path, output);
      if (nested.error) return nested;
      continue;
    }

    if (Array.isArray(rawValue)) {
      return { error: `Arrays are not supported for content field ${path}.` };
    }

    output.push([path, rawValue]);
  }

  return { entries: output };
};

const ensurePageScopedContent = (content, page) => {
  if (!isPlainObject(content)) {
    return { [page]: {} };
  }

  if (isPlainObject(content[page])) {
    return { [page]: content[page] };
  }

  return { [page]: content };
};

const sanitizeContentFieldValue = (path, value, rule) => {
  const text = sanitizeText(value, rule?.maxLength || 1000);
  if (!text) {
    return { error: `Field ${path} is required.` };
  }

  if (rule?.kind === "href" && !isSafeHrefValue(text)) {
    return { error: `Field ${path} must be a safe URL or path.` };
  }

  if (rule?.kind === "asset" && !isSafeAssetSrcValue(text)) {
    return { error: `Field ${path} must be a safe asset URL or path.` };
  }

  return { value: text };
};

const sanitizeContentDraftPayload = (draft, page) => {
  if (!isPlainObject(draft)) {
    return { error: "Draft payload must be an object." };
  }

  const scopedDraft = ensurePageScopedContent(draft, page);
  const listed = listContentLeafEntries(scopedDraft);
  if (listed.error) {
    return listed;
  }

  const entries = listed.entries || [];
  if (!entries.length) {
    return { error: "Draft payload is empty." };
  }

  const sanitized = {};
  const pagePrefix = `${page}.`;

  for (const [path, rawValue] of entries) {
    if (!path.startsWith(pagePrefix)) {
      return { error: `Field ${path} is not allowed for page ${page}.` };
    }

    const rule = CONTENT_ALLOWED_FIELDS[path];
    if (!rule) {
      return { error: `Field ${path} is not supported for page ${page}.` };
    }

    const cleaned = sanitizeContentFieldValue(path, rawValue, rule);
    if (cleaned.error) {
      return cleaned;
    }

    setNestedValue(sanitized, path, cleaned.value);
  }

  return { content: sanitized };
};

const buildContentPageResponse = (record, page, phase, options = {}) => {
  const publicView = Boolean(options.publicView);
  const fallbackDraft = { content: { [page]: {} }, updatedAt: "", updatedBy: "" };
  const fallbackPublished = { content: { [page]: {} }, updatedAt: "", updatedBy: "" };

  const draft = {
    ...fallbackDraft,
    ...(isPlainObject(record?.draft) ? record.draft : {})
  };
  const published = {
    ...fallbackPublished,
    ...(isPlainObject(record?.published) ? record.published : {})
  };

  draft.content = ensurePageScopedContent(draft.content, page);
  published.content = ensurePageScopedContent(published.content, page);

  const base = {
    page,
    phase,
    updatedAt: sanitizeText(record?.updatedAt, 64),
    publishedAt: sanitizeText(record?.publishedAt || published.updatedAt, 64)
  };

  if (publicView) {
    return {
      ...base,
      published
    };
  }

  return {
    ...base,
    draft,
    published
  };
};

const loadJsonRecord = async (env, key) => {
  const raw = await env.SUBSCRIBERS.get(key);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return null;
  }
};

const saveJsonRecord = async (env, key, record) => {
  await env.SUBSCRIBERS.put(key, JSON.stringify(record));
};

const loadAdminUserByEmail = async (env, email) => {
  const candidates = getAdminEmailCandidates(email);
  if (!candidates.length) {
    return null;
  }

  for (const candidate of candidates) {
    const raw = await env.SUBSCRIBERS.get(getAdminUserKey(candidate));
    if (!raw) {
      continue;
    }

    try {
      const user = JSON.parse(raw);
      if (!user || !isValidEmail(user.email)) {
        continue;
      }
      return user;
    } catch (error) {
      continue;
    }
  }
  return null;
};

const adminUsersExist = async (env) => {
  const response = await env.SUBSCRIBERS.list({ prefix: ADMIN_USER_PREFIX, limit: 1 });
  return response.keys.length > 0;
};

const loadConfiguredAllowedAdminUsers = async (env) => {
  const allowedEmails = getAllowedAdminEmails(env);
  const users = await Promise.all(
    allowedEmails.map(async (email) => loadAdminUserByEmail(env, email))
  );
  return users.filter(Boolean);
};

const saveAdminUser = async (env, user) => {
  await env.SUBSCRIBERS.put(getAdminUserKey(user.email), JSON.stringify(user));
};

const signJsonToken = async (secret, payload) => {
  if (!secret) {
    throw new Error("Missing signing secret");
  }

  const payloadSegment = toBase64Url(JSON.stringify(payload));
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadSegment));
  return `${payloadSegment}.${toBase64Url(new Uint8Array(signature))}`;
};

const verifyJsonToken = async (token, secret) => {
  if (!secret || !token || !token.includes(".")) {
    return null;
  }

  const [payloadSegment, signatureSegment] = token.split(".", 2);
  if (!payloadSegment || !signatureSegment) {
    return null;
  }

  const key = await importHmacKey(secret);
  const expectedSignature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(payloadSegment));
  const providedSignature = fromBase64Url(signatureSegment);
  if (!timingSafeEqual(new Uint8Array(expectedSignature), providedSignature)) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(fromBase64Url(payloadSegment)));
  } catch (error) {
    return null;
  }
};

const createAdminToken = async (env, user) => {
  const secret = getAdminSigningSecret(env);
  if (!secret) {
    throw new Error("Missing admin signing secret");
  }

  const issuedAt = Date.now();
  const passwordUpdatedAt = getAdminPasswordTimestamp(user);
  const payload = {
    scope: "admin",
    email: normalizeAdminEmail(user?.email),
    pwdAt: passwordUpdatedAt,
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_MS
  };

  const token = await signJsonToken(secret, payload);
  return {
    token,
    expiresAt: new Date(payload.exp).toISOString()
  };
};

const verifyAdminToken = async (token, env) => {
  const secret = getAdminSigningSecret(env);
  const payload = await verifyJsonToken(token, secret);
  if (!payload) {
    return null;
  }

  if (payload.scope !== "admin") return null;
  if (!isValidEmail(payload.email)) return null;
  if (!payload.pwdAt) return null;
  if (!payload.exp || Number(payload.exp) <= Date.now()) return null;
  return payload;
};

const getAdminTokenFromRequest = (request) => {
  const header = request.headers.get("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    return "";
  }
  return header.slice("Bearer ".length).trim();
};

const getVerifiedAdminSession = async (request, env) => {
  const token = getAdminTokenFromRequest(request);
  const session = await verifyAdminToken(token, env);
  if (!session) {
    return null;
  }

  const user = await loadAdminUserByEmail(env, normalizeAdminEmail(session.email));
  if (!user) {
    return null;
  }

  const currentPasswordTimestamp = getAdminPasswordTimestamp(user);
  if (!currentPasswordTimestamp || currentPasswordTimestamp !== session.pwdAt) {
    return null;
  }

  return { session, user };
};

const getAdminResetMailers = (env) => {
  const mailers = [];
  if (env.ADMIN_RESET_EMAIL && typeof env.ADMIN_RESET_EMAIL.send === "function") {
    mailers.push({ name: "ADMIN_RESET_EMAIL", binding: env.ADMIN_RESET_EMAIL });
  }
  if (env.CONTACT_EMAIL && typeof env.CONTACT_EMAIL.send === "function") {
    const alreadyAdded = mailers.some((entry) => entry.binding === env.CONTACT_EMAIL);
    if (!alreadyAdded) {
      mailers.push({ name: "CONTACT_EMAIL", binding: env.CONTACT_EMAIL });
    }
  }
  return mailers;
};

const getAdminResetMailer = (env) => getAdminResetMailers(env)[0]?.binding || null;

const getAdminResetSender = (env) => {
  return sanitizeText(env.ADMIN_RESET_FROM_EMAIL || env.CONTACT_FORM_FROM_EMAIL, 254) || "contact@friendsofwdac.org";
};

const getAdminSiteUrl = (env, origin) => {
  const allowedOrigins = (env.ALLOWED_ORIGIN || "")
    .split(",")
    .map((value) => value.trim())
    .filter((value) => /^https?:\/\//.test(value));
  const configured = sanitizeText(env.ADMIN_SITE_URL, 300);
  if (/^https?:\/\//.test(configured)) {
    const normalizedConfigured = configured.replace(/\/+$/, "");
    if (!allowedOrigins.length || allowedOrigins.includes(normalizedConfigured)) {
      return normalizedConfigured;
    }
  }

  if (origin && origin !== "*" && origin !== "null" && /^https?:\/\//.test(origin)) {
    return origin.replace(/\/+$/, "");
  }

  const fallback = allowedOrigins[0];

  return (fallback || "https://friendsofwdac.org").replace(/\/+$/, "");
};

const createAdminResetToken = async (env, user) => {
  const secret = getAdminResetSecret(env);
  if (!secret) {
    throw new Error("Missing admin reset secret");
  }

  const issuedAt = Date.now();
  const tokenId = crypto.randomUUID ? crypto.randomUUID() : `${issuedAt}-${Math.random()}`;
  const payload = {
    scope: "admin-reset",
    jti: tokenId,
    email: normalizeAdminEmail(user?.email),
    pwdAt: getAdminPasswordTimestamp(user),
    iat: issuedAt,
    exp: issuedAt + ADMIN_RESET_TTL_MS
  };

  const token = await signJsonToken(secret, payload);
  return {
    token,
    tokenId,
    expiresAt: new Date(payload.exp).toISOString()
  };
};

const verifyAdminResetToken = async (token, env) => {
  const payload = await verifyJsonToken(token, getAdminResetSecret(env));
  if (!payload) {
    return null;
  }

  if (payload.scope !== "admin-reset") return null;
  if (!payload.jti) return null;
  if (!isValidEmail(payload.email)) return null;
  if (!payload.pwdAt) return null;
  if (!payload.exp || Number(payload.exp) <= Date.now()) return null;
  return payload;
};

const buildAdminResetUrl = (env, origin, token) => {
  const baseUrl = getAdminSiteUrl(env, origin);
  return `${baseUrl}/admin/?reset=${encodeURIComponent(token)}#admin-reset-card`;
};

const normalizeFieldValue = (value, maxLength = 1000) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => sanitizeText(entry, maxLength))
      .filter(Boolean)
      .slice(0, 20);
  }
  return sanitizeText(value, maxLength);
};

const toPositiveAmount = (value) => {
  const numeric = Number(String(value || "").replace(/[$,]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return Math.round(numeric * 100) / 100;
};

const toPositiveInteger = (value, fallback, max = 100) => {
  const numeric = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(numeric) || numeric <= 0) return fallback;
  return Math.min(numeric, max);
};

const parseFormPayload = (payload) => {
  if (!payload || typeof payload !== "object") {
    return { error: "Invalid JSON payload" };
  }

  const formType = sanitizeText(payload.formType, 64).toLowerCase();
  const rawFields = payload.fields;
  if (!rawFields || typeof rawFields !== "object" || Array.isArray(rawFields)) {
    return { error: "Missing form fields" };
  }

  const fields = {};
  for (const [key, value] of Object.entries(rawFields)) {
    const fieldKey = sanitizeText(key, 64);
    if (!fieldKey) continue;
    fields[fieldKey] = normalizeFieldValue(value, 2000);
  }

  const firstName = sanitizeText(fields.first_name, 120);
  const lastName = sanitizeText(fields.last_name, 120);
  const email = sanitizeText(fields.email, 254).toLowerCase();
  const phone = sanitizeText(fields.phone, 60);
  const comments = sanitizeText(fields.comments, 4000);
  const consent = sanitizeText(fields.consent, 40);

  if (!firstName || !lastName || !isValidEmail(email)) {
    return { error: "Missing required contact information" };
  }

  if (!consent) {
    return { error: "You must confirm consent before submitting" };
  }

  if (formType === "membership") {
    const participationInterest = Array.isArray(fields.participation_interest)
      ? fields.participation_interest
      : fields.participation_interest
        ? [fields.participation_interest]
        : [];
    const wdacRelation = Array.isArray(fields.wdac_relation)
      ? fields.wdac_relation
      : fields.wdac_relation
        ? [fields.wdac_relation]
        : [];
    const donationIntent = sanitizeText(fields.donation_intent, 120);
    const donationAmount = fields.donation_amount ? toPositiveAmount(fields.donation_amount) : null;

    const normalized = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      street: sanitizeText(fields.street, 200),
      city: sanitizeText(fields.city, 120),
      state: sanitizeText(fields.state, 60),
      zip: sanitizeText(fields.zip, 20),
      participation_interest: participationInterest,
      wdac_relation: wdacRelation,
      alumni_grad_year: sanitizeText(fields.alumni_grad_year, 10),
      donation_intent: donationIntent,
      donation_amount: donationAmount,
      comments,
      consent
    };

    return { formType, fields: normalized };
  }

  if (formType === "general-donation") {
    const amount = toPositiveAmount(fields.donation_amount);
    const frequency = sanitizeText(fields.donation_frequency, 80);
    if (!amount || !frequency) {
      return { error: "Donation amount and frequency are required" };
    }

    const normalized = {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      street: sanitizeText(fields.street, 200),
      city: sanitizeText(fields.city, 120),
      state: sanitizeText(fields.state, 60),
      donation_amount: amount,
      donation_frequency: frequency,
      designation: sanitizeText(fields.designation, 160),
      tribute_name: sanitizeText(fields.tribute_name, 180),
      special_instructions: sanitizeText(fields.special_instructions, 4000),
      comments,
      consent
    };

    return { formType, fields: normalized };
  }

  return { error: "Unsupported form type" };
};

const parseContactPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { error: "Invalid JSON payload" };
  }

  const name = sanitizeText(payload.name, 160);
  const email = sanitizeText(payload.email, 254).toLowerCase();
  const phone = sanitizeText(payload.phone, 60);
  const subject = sanitizeText(payload.subject, 180);
  const message = sanitizeText(payload.message, CONTACT_MAX_MESSAGE_LENGTH);
  const website = sanitizeText(payload.website, 200);

  if (website) {
    return { spam: true };
  }

  if (!name) {
    return { error: "Your name is required." };
  }

  if (!isValidEmail(email)) {
    return { error: "A valid email address is required." };
  }

  if (!message) {
    return { error: "A message is required." };
  }

  return {
    fields: {
      name,
      email,
      phone,
      subject,
      message
    }
  };
};

const getOnlineFormLabel = (formType) => {
  if (formType === "membership") return "Membership form";
  if (formType === "general-donation") return "General donation form";
  return "Online form";
};

const formatNotificationValue = (value) => {
  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "Not provided";
  }
  if (value === null || value === undefined || value === "") {
    return "Not provided";
  }
  return String(value);
};

const sendOnlineFormNotification = async (env, record, recordId) => {
  if (!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send !== "function") {
    console.warn("Online form notification skipped: CONTACT_EMAIL binding is not configured.");
    return;
  }

  const recipient = sanitizeText(env.CONTACT_FORM_TO_EMAIL, 254) || "contact@friendsofwdac.org";
  const sender = sanitizeText(env.CONTACT_FORM_FROM_EMAIL, 254) || recipient;
  const fields = record.fields || {};
  const name = `${sanitizeText(fields.first_name, 120)} ${sanitizeText(fields.last_name, 120)}`.trim();
  const email = sanitizeText(fields.email, 254).toLowerCase();
  const formLabel = getOnlineFormLabel(record.formType);

  if (!isValidEmail(recipient) || !isValidEmail(sender)) {
    console.warn("Online form notification skipped: notification email addresses are not configured correctly.");
    return;
  }

  const fieldRows = Object.entries(fields).map(([key, value]) => ({
    label: key.replace(/_/g, " "),
    value: formatNotificationValue(value)
  }));

  const textBody = [
    `New ${formLabel.toLowerCase()} submission from the Friends of WDAC website.`,
    "",
    `Record ID: ${recordId}`,
    `Submitted: ${record.submittedAt}`,
    `Origin: ${record.origin || "Unknown"}`,
    "",
    ...fieldRows.map((row) => `${row.label}: ${row.value}`),
    "",
    "This submission has also been saved in the Client Admin forms inbox."
  ].join("\n");

  const htmlBody = `
    <h1>New ${escapeHtml(formLabel)} submission</h1>
    <p><strong>Record ID:</strong> ${escapeHtml(recordId)}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(record.submittedAt)}</p>
    <p><strong>Origin:</strong> ${escapeHtml(record.origin || "Unknown")}</p>
    <hr />
    ${fieldRows
      .map((row) => `<p><strong>${escapeHtml(row.label)}:</strong> ${textToHtml(row.value)}</p>`)
      .join("")}
    <hr />
    <p>This submission has also been saved in the Client Admin forms inbox.</p>
  `;

  try {
    await env.CONTACT_EMAIL.send({
      to: recipient,
      from: { email: sender, name: "Friends of WDAC Website" },
      replyTo: isValidEmail(email) ? { email, name: name || email } : { email: sender, name: "Friends of WDAC Website" },
      subject: `New Friends of WDAC ${formLabel} submission`,
      text: textBody,
      html: htmlBody
    });
  } catch (error) {
    console.error("Online form notification failed", error?.code || "", error?.message || error);
  }
};

const handleSubscribe = async (request, env, origin) => {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const email = String(payload.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return json({ error: "Invalid email" }, 400, origin || "*");
  }

  const key = `email:${email}`;
  const existing = await env.SUBSCRIBERS.get(key);
  if (!existing) {
    const record = {
      email,
      createdAt: new Date().toISOString(),
      ip: request.headers.get("CF-Connecting-IP") || null,
      ua: request.headers.get("User-Agent") || null
    };
    await env.SUBSCRIBERS.put(key, JSON.stringify(record));
  }

  return json({ ok: true }, 200, origin || "*");
};

const handleOnlineForm = async (request, env, origin) => {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const parsed = parseFormPayload(payload);
  if (parsed.error) {
    return json({ error: parsed.error }, 400, origin || "*");
  }

  const submittedAt = new Date().toISOString();
  const suffix = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
  const key = `form:${parsed.formType}:${Date.now()}:${suffix}`;

  const record = {
    formType: parsed.formType,
    fields: parsed.fields,
    submittedAt,
    ip: request.headers.get("CF-Connecting-IP") || null,
    ua: request.headers.get("User-Agent") || null,
    origin: request.headers.get("Origin") || null
  };

  await env.SUBSCRIBERS.put(key, JSON.stringify(record));
  await sendOnlineFormNotification(env, record, key);
  return json({ ok: true, id: key }, 200, origin || "*");
};

const handleContactForm = async (request, env, origin) => {
  if (!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send !== "function") {
    return json({ error: "Contact email delivery is not configured yet." }, 500, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const parsed = parseContactPayload(payload);
  if (parsed.error) {
    return json({ error: parsed.error }, 400, origin || "*");
  }

  if (parsed.spam) {
    return json({ ok: true }, 200, origin || "*");
  }

  const recipient = sanitizeText(env.CONTACT_FORM_TO_EMAIL, 254) || "contact@friendsofwdac.org";
  const sender = sanitizeText(env.CONTACT_FORM_FROM_EMAIL, 254) || recipient;

  if (!isValidEmail(recipient) || !isValidEmail(sender)) {
    return json({ error: "Contact email addresses are not configured correctly." }, 500, origin || "*");
  }

  const { name, email, phone, subject, message } = parsed.fields;
  const submittedAt = new Date().toISOString();
  const subjectLine = subject ? `Website contact: ${subject}` : "Website contact message";
  const textBody = [
    "New message from the Friends of WDAC website contact form.",
    "",
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Subject: ${subject || "Not provided"}`,
    `Submitted: ${submittedAt}`,
    `Origin: ${request.headers.get("Origin") || "Unknown"}`,
    "",
    "Message:",
    message
  ].join("\n");
  const htmlBody = `
    <h1>New website contact message</h1>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject || "Not provided")}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <p><strong>Origin:</strong> ${escapeHtml(request.headers.get("Origin") || "Unknown")}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${textToHtml(message)}</p>
  `;

  try {
    const result = await env.CONTACT_EMAIL.send({
      to: recipient,
      from: { email: sender, name: "Friends of WDAC Website" },
      replyTo: { email, name },
      subject: subjectLine,
      text: textBody,
      html: htmlBody
    });

    return json({ ok: true, messageId: result?.messageId || null }, 200, origin || "*");
  } catch (error) {
    console.error("Contact email failed", error?.code || "", error?.message || error);
    return json(
      { error: "Unable to send your message right now. Please email contact@friendsofwdac.org directly." },
      500,
      origin || "*"
    );
  }
};

const handleAdminSupportContact = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  if (!env.CONTACT_EMAIL || typeof env.CONTACT_EMAIL.send !== "function") {
    return json({ error: "Support email delivery is not configured yet." }, 500, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const parsed = parseContactPayload(payload);
  if (parsed.error) {
    return json({ error: parsed.error }, 400, origin || "*");
  }

  if (parsed.spam) {
    return json({ ok: true }, 200, origin || "*");
  }

  const recipient = sanitizeText(env.ADMIN_SUPPORT_TO_EMAIL, 254) || "contact@shannonborntrager.com";
  const sender = sanitizeText(env.ADMIN_SUPPORT_FROM_EMAIL || env.CONTACT_FORM_FROM_EMAIL, 254) || recipient;

  if (!isValidEmail(recipient) || !isValidEmail(sender)) {
    return json({ error: "Support email addresses are not configured correctly." }, 500, origin || "*");
  }

  const { name, email, phone, subject, message } = parsed.fields;
  const submittedAt = new Date().toISOString();
  const adminUserEmail = sanitizeText(verified?.user?.email, 254) || "unknown-admin";
  const subjectLine = subject ? `Admin support: ${subject}` : "Admin support message";
  const textBody = [
    "New support message from the Friends of WDAC admin dashboard.",
    "",
    `Submitted by admin user: ${adminUserEmail}`,
    `Name: ${name}`,
    `Email: ${email}`,
    `Phone: ${phone || "Not provided"}`,
    `Subject: ${subject || "Not provided"}`,
    `Submitted: ${submittedAt}`,
    `Origin: ${request.headers.get("Origin") || "Unknown"}`,
    "",
    "Message:",
    message
  ].join("\n");
  const htmlBody = `
    <h1>New admin support message</h1>
    <p><strong>Submitted by admin user:</strong> ${escapeHtml(adminUserEmail)}</p>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || "Not provided")}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject || "Not provided")}</p>
    <p><strong>Submitted:</strong> ${escapeHtml(submittedAt)}</p>
    <p><strong>Origin:</strong> ${escapeHtml(request.headers.get("Origin") || "Unknown")}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${textToHtml(message)}</p>
  `;

  try {
    const result = await env.CONTACT_EMAIL.send({
      to: recipient,
      from: { email: sender, name: "Friends of WDAC Admin" },
      replyTo: { email, name },
      subject: subjectLine,
      text: textBody,
      html: htmlBody
    });

    await writeAuditLog(env, verified.user, "admin_support_contact_sent", {
      recipient,
      subject: subject || null
    });

    return json({ ok: true, messageId: result?.messageId || null }, 200, origin || "*");
  } catch (error) {
    console.error("Admin support email failed", error?.code || "", error?.message || error);
    return json(
      { error: "Unable to send support message right now. Please email contact@shannonborntrager.com directly." },
      500,
      origin || "*"
    );
  }
};

const listAllKeys = async (env, prefix) => {
  const keys = [];
  let cursor;

  do {
    const response = await env.SUBSCRIBERS.list({ prefix, cursor, limit: 1000 });
    keys.push(...response.keys);
    cursor = response.list_complete ? undefined : response.cursor;
  } while (cursor);

  return keys;
};

const loadRecordsByPrefix = async (env, prefix) => {
  const keys = await listAllKeys(env, prefix);
  const values = await Promise.all(
    keys.map(async ({ name }) => {
      const raw = await env.SUBSCRIBERS.get(name);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(raw);
        return { id: name, ...parsed };
      } catch (error) {
        return null;
      }
    })
  );

  return values.filter(Boolean);
};

const sortNewestFirst = (records, keyName) => {
  return [...records].sort((left, right) => {
    const leftTime = Date.parse(left[keyName] || "") || 0;
    const rightTime = Date.parse(right[keyName] || "") || 0;
    return rightTime - leftTime;
  });
};

const hasMeaningfulFieldValue = (value) => {
  if (Array.isArray(value)) {
    return value.some((item) => hasMeaningfulFieldValue(item));
  }

  return sanitizeText(value, 4000).length > 0;
};

const summarizeStats = (formRecords, subscriberRecords) => {
  const membershipForms = formRecords.filter((record) => record.formType === "membership").length;
  const donationForms = formRecords.filter((record) => record.formType === "general-donation").length;
  const interestLeads = formRecords.filter((record) => {
    if (record.formType !== "membership") return false;
    return hasMeaningfulFieldValue(record?.fields?.participation_interest);
  }).length;
  const followUpForms = formRecords.filter((record) => {
    const fields = record?.fields || {};
    return ["comments", "special_instructions", "designation", "tribute_name"].some((key) =>
      hasMeaningfulFieldValue(fields[key])
    );
  }).length;
  const latestFormAt = sortNewestFirst(formRecords, "submittedAt")[0]?.submittedAt || "";
  const latestSubscriberAt = sortNewestFirst(subscriberRecords, "createdAt")[0]?.createdAt || "";

  return {
    totalForms: formRecords.length,
    membershipForms,
    donationForms,
    totalSubscribers: subscriberRecords.length,
    interestLeads,
    followUpForms,
    latestFormAt,
    latestSubscriberAt
  };
};

const sanitizePreviewRows = (rows) => {
  if (!Array.isArray(rows)) {
    return [];
  }

  return rows.slice(0, 10).map((row) => {
    if (!row || typeof row !== "object" || Array.isArray(row)) {
      return {};
    }

    const preview = {};
    Object.entries(row)
      .slice(0, 12)
      .forEach(([key, value]) => {
        const nextKey = sanitizeText(key, 60);
        if (!nextKey) return;
        preview[nextKey] = sanitizeText(value, 240);
      });
    return preview;
  });
};

const buildDisplayName = (explicitName, firstName, lastName, fallback = "") => {
  const name = sanitizeText(explicitName, 200);
  if (name) return name;

  const combined = [sanitizeText(firstName, 100), sanitizeText(lastName, 100)].filter(Boolean).join(" ").trim();
  return combined || sanitizeText(fallback, 200) || "";
};

const findAdminPersonByContact = async (env, normalizedEmail, normalizedPhone) => {
  if (!normalizedEmail && !normalizedPhone) {
    return null;
  }

  const people = await loadRecordsByPrefix(env, ADMIN_PERSON_PREFIX);
  return (
    people.find((person) => normalizedEmail && person.normalizedEmail === normalizedEmail) ||
    people.find((person) => normalizedPhone && person.normalizedPhone === normalizedPhone) ||
    null
  );
};

const upsertAdminPersonRecord = async (env, payload = {}) => {
  const requestedPersonId = sanitizeText(payload.personId, 120);
  let existingPerson = requestedPersonId ? await loadJsonRecord(env, getAdminPersonKey(requestedPersonId)) : null;

  const normalizedEmail = isValidEmail(normalizeEmail(payload.email)) ? normalizeEmail(payload.email) : "";
  const normalizedPhone = normalizePhone(payload.phone);

  if (!existingPerson) {
    existingPerson = await findAdminPersonByContact(env, normalizedEmail, normalizedPhone);
  }

  const now = new Date().toISOString();
  const personId = sanitizeText(existingPerson?.id || requestedPersonId, 120) || createRecordId();
  const firstName = sanitizeText(payload.firstName ?? existingPerson?.firstName, 100);
  const lastName = sanitizeText(payload.lastName ?? existingPerson?.lastName, 100);
  const email = sanitizeText(payload.email ?? existingPerson?.email, 254);
  const phone = sanitizeText(payload.phone ?? existingPerson?.phone, 64);
  const record = {
    id: personId,
    type: "person",
    createdAt: existingPerson?.createdAt || now,
    updatedAt: now,
    name: buildDisplayName(payload.name, firstName, lastName, existingPerson?.name || email || phone || "Unknown person"),
    firstName,
    lastName,
    email,
    normalizedEmail: isValidEmail(normalizeEmail(email)) ? normalizeEmail(email) : "",
    phone,
    normalizedPhone: normalizePhone(phone),
    street: sanitizeText(payload.street ?? existingPerson?.street, 160),
    city: sanitizeText(payload.city ?? existingPerson?.city, 100),
    state: sanitizeText(payload.state ?? existingPerson?.state, 40),
    zip: sanitizeText(payload.zip ?? existingPerson?.zip, 20),
    notes: sanitizeText(payload.notes ?? existingPerson?.notes, 4000),
    roles: uniqueValues([...(existingPerson?.roles || []), ...((payload.roles || []).map((value) => sanitizeText(value, 40)))]).sort(),
    memberRecordIds: uniqueValues([...(existingPerson?.memberRecordIds || []), sanitizeText(payload.memberRecordId, 120)]),
    donorRecordIds: uniqueValues([...(existingPerson?.donorRecordIds || []), sanitizeText(payload.donorRecordId, 120)]),
    importBatchIds: uniqueValues([...(existingPerson?.importBatchIds || []), sanitizeText(payload.importBatchId, 120)]),
    lastSource: sanitizeText(payload.lastSource ?? existingPerson?.lastSource, 80),
    lastSourceAt: sanitizeText(payload.lastSourceAt ?? existingPerson?.lastSourceAt, 64) || now
  };

  await saveJsonRecord(env, getAdminPersonKey(personId), record);
  return record;
};

const sanitizeMemberRecordPayload = (payload = {}, existing = {}) => {
  const firstName = sanitizeText(payload.firstName ?? payload.first_name ?? existing.firstName, 100);
  const lastName = sanitizeText(payload.lastName ?? payload.last_name ?? existing.lastName, 100);
  const email = sanitizeText(payload.email ?? existing.email, 254);
  const phone = sanitizeText(payload.phone ?? existing.phone, 64);

  return {
    personId: sanitizeText(payload.personId ?? payload.person_id ?? existing.personId, 120),
    source: sanitizeText(payload.source ?? existing.source, 80) || "manual",
    sourceRecordId: sanitizeText(payload.sourceRecordId ?? payload.source_record_id ?? existing.sourceRecordId, 320),
    sourceBatchId: sanitizeText(payload.sourceBatchId ?? payload.source_batch_id ?? existing.sourceBatchId, 120),
    name: buildDisplayName(payload.name, firstName, lastName, existing.name || email || "Member"),
    firstName,
    lastName,
    email,
    normalizedEmail: isValidEmail(normalizeEmail(email)) ? normalizeEmail(email) : "",
    phone,
    normalizedPhone: normalizePhone(phone),
    street: sanitizeText(payload.street ?? existing.street, 160),
    city: sanitizeText(payload.city ?? existing.city, 100),
    state: sanitizeText(payload.state ?? existing.state, 40),
    zip: sanitizeText(payload.zip ?? existing.zip, 20),
    joinDate: toIsoDateOnly(payload.joinDate ?? payload.join_date ?? existing.joinDate),
    renewalDate: toIsoDateOnly(payload.renewalDate ?? payload.renewal_date ?? existing.renewalDate),
    status: sanitizeText(payload.status ?? existing.status, 40) || "active",
    notes: sanitizeText(payload.notes ?? payload.comments ?? existing.notes, 4000)
  };
};

const sanitizeDonorRecordPayload = (payload = {}, existing = {}) => {
  const firstName = sanitizeText(payload.firstName ?? payload.first_name ?? existing.firstName, 100);
  const lastName = sanitizeText(payload.lastName ?? payload.last_name ?? existing.lastName, 100);
  const email = sanitizeText(payload.email ?? existing.email, 254);
  const phone = sanitizeText(payload.phone ?? existing.phone, 64);
  const frequency = sanitizeText(payload.frequency ?? payload.donationFrequency ?? existing.frequency, 60);
  const rawAmount = payload.amount ?? payload.donationAmount ?? existing.amount;
  const amountWasProvided = payload.amount !== undefined || payload.donationAmount !== undefined;
  const parsedAmount = toPositiveAmount(rawAmount);
  const fallbackAmount = Number(existing.amount);

  let recurring;
  if (payload.recurring !== undefined) {
    recurring = toBoolean(payload.recurring);
  } else if (frequency) {
    recurring = /recurr|monthly|annual|quarterly/i.test(frequency);
  } else {
    recurring = Boolean(existing.recurring);
  }

  return {
    personId: sanitizeText(payload.personId ?? payload.person_id ?? existing.personId, 120),
    source: sanitizeText(payload.source ?? existing.source, 80) || "manual",
    sourceRecordId: sanitizeText(payload.sourceRecordId ?? payload.source_record_id ?? existing.sourceRecordId, 320),
    sourceBatchId: sanitizeText(payload.sourceBatchId ?? payload.source_batch_id ?? existing.sourceBatchId, 120),
    name: buildDisplayName(payload.name, firstName, lastName, existing.name || email || "Donor"),
    firstName,
    lastName,
    email,
    normalizedEmail: isValidEmail(normalizeEmail(email)) ? normalizeEmail(email) : "",
    phone,
    normalizedPhone: normalizePhone(phone),
    amount: parsedAmount > 0 ? parsedAmount : (amountWasProvided ? null : (Number.isFinite(fallbackAmount) && fallbackAmount > 0 ? fallbackAmount : null)),
    donationDate: toIsoDateOnly(payload.donationDate ?? payload.donation_date ?? existing.donationDate),
    paymentStatus: sanitizeText(payload.paymentStatus ?? payload.payment_status ?? existing.paymentStatus, 40) || "paid",
    frequency,
    recurring,
    notes: sanitizeText(payload.notes ?? payload.comments ?? existing.notes, 4000)
  };
};

const sanitizeImportBatchPayload = (payload = {}, existing = {}) => {
  const entityType = sanitizeText(payload.entityType ?? payload.type ?? existing.entityType, 40).toLowerCase();
  return {
    entityType,
    fileName: sanitizeText(payload.fileName ?? payload.file_name ?? existing.fileName, 200) || `${entityType || "records"}-import.csv`,
    rowCount: Math.max(0, toPositiveInteger(payload.rowCount ?? payload.row_count, Number(existing.rowCount) || 0, 50000)),
    status: sanitizeText(payload.status ?? existing.status, 40) || "staged",
    notes: sanitizeText(payload.notes ?? existing.notes, 2000),
    previewRows: sanitizePreviewRows(payload.previewRows ?? existing.previewRows),
    source: sanitizeText(payload.source ?? existing.source, 80) || "admin-upload",
    uploadedAt: sanitizeText(payload.uploadedAt ?? payload.uploaded_at ?? existing.uploadedAt, 64)
  };
};

const buildMemberRecord = async (env, payload = {}, existing = null) => {
  const base = sanitizeMemberRecordPayload(payload, existing || {});
  const now = new Date().toISOString();
  const memberId = sanitizeText(existing?.id, 120) || createRecordId();
  const memberRecord = {
    id: memberId,
    type: "member",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    ...base
  };

  const person = await upsertAdminPersonRecord(env, {
    personId: memberRecord.personId,
    name: memberRecord.name,
    firstName: memberRecord.firstName,
    lastName: memberRecord.lastName,
    email: memberRecord.email,
    phone: memberRecord.phone,
    street: memberRecord.street,
    city: memberRecord.city,
    state: memberRecord.state,
    zip: memberRecord.zip,
    notes: memberRecord.notes,
    roles: ["member"],
    memberRecordId: memberRecord.id,
    importBatchId: memberRecord.sourceBatchId,
    lastSource: memberRecord.source,
    lastSourceAt: now
  });

  memberRecord.personId = person.id;
  return memberRecord;
};

const buildDonorRecord = async (env, payload = {}, existing = null) => {
  const base = sanitizeDonorRecordPayload(payload, existing || {});
  const now = new Date().toISOString();
  const donorId = sanitizeText(existing?.id, 120) || createRecordId();
  const donorRecord = {
    id: donorId,
    type: "donor",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    ...base
  };

  const person = await upsertAdminPersonRecord(env, {
    personId: donorRecord.personId,
    name: donorRecord.name,
    firstName: donorRecord.firstName,
    lastName: donorRecord.lastName,
    email: donorRecord.email,
    phone: donorRecord.phone,
    notes: donorRecord.notes,
    roles: ["donor"],
    donorRecordId: donorRecord.id,
    importBatchId: donorRecord.sourceBatchId,
    lastSource: donorRecord.source,
    lastSourceAt: now
  });

  donorRecord.personId = person.id;
  return donorRecord;
};

const loadAdminPeople = async (env) => sortNewestFirst(await loadRecordsByPrefix(env, ADMIN_PERSON_PREFIX), "updatedAt");
const loadAdminMembers = async (env) => sortNewestFirst(await loadRecordsByPrefix(env, ADMIN_MEMBER_PREFIX), "updatedAt");
const loadAdminDonors = async (env) => sortNewestFirst(await loadRecordsByPrefix(env, ADMIN_DONOR_PREFIX), "updatedAt");
const loadAdminImports = async (env) => sortNewestFirst(await loadRecordsByPrefix(env, ADMIN_IMPORT_PREFIX), "uploadedAt");

const getFormBackfillRecordId = (target, sourceRecordId) => {
  return `${target}-${toBase64Url(sourceRecordId)}`;
};

const syncAdminRecordsFromFormRecords = async (env, formRecords = []) => {
  if (!Array.isArray(formRecords) || !formRecords.length) {
    return { createdMembers: 0, createdDonors: 0, memberRecords: [], donorRecords: [] };
  }

  const [existingMembers, existingDonors] = await Promise.all([
    loadAdminMembers(env),
    loadAdminDonors(env)
  ]);

  const memberSourceRecordIds = new Set(
    existingMembers
      .map((record) => sanitizeText(record?.sourceRecordId, 320))
      .filter(Boolean)
  );
  const donorSourceRecordIds = new Set(
    existingDonors
      .map((record) => sanitizeText(record?.sourceRecordId, 320))
      .filter(Boolean)
  );

  let createdMembers = 0;
  let createdDonors = 0;
  const nextMemberRecords = [...existingMembers];
  const nextDonorRecords = [...existingDonors];

  const sortedFormRecords = [...formRecords].sort((left, right) => {
    const leftTime = Date.parse(left?.submittedAt || left?.createdAt || "") || 0;
    const rightTime = Date.parse(right?.submittedAt || right?.createdAt || "") || 0;
    return leftTime - rightTime;
  });

  for (const formRecord of sortedFormRecords) {
    const sourceRecordId = sanitizeText(formRecord?.id, 320);
    if (!sourceRecordId) continue;

    if (formRecord?.formType === "membership") {
      if (memberSourceRecordIds.has(sourceRecordId)) continue;

      const createdAt = sanitizeText(formRecord?.submittedAt || formRecord?.createdAt, 64) || new Date().toISOString();
      const memberRecord = await buildMemberRecord(
        env,
        buildConversionPayloadFromSourceRecord(formRecord, "member", sourceRecordId),
        {
          id: getFormBackfillRecordId("member", sourceRecordId),
          createdAt,
          sourceRecordId
        }
      );
      await saveJsonRecord(env, getAdminMemberKey(memberRecord.id), memberRecord);
      memberSourceRecordIds.add(sourceRecordId);
      nextMemberRecords.push(memberRecord);
      createdMembers += 1;
      continue;
    }

    if (formRecord?.formType === "general-donation") {
      if (donorSourceRecordIds.has(sourceRecordId)) continue;

      const createdAt = sanitizeText(formRecord?.submittedAt || formRecord?.createdAt, 64) || new Date().toISOString();
      const donorRecord = await buildDonorRecord(
        env,
        buildConversionPayloadFromSourceRecord(formRecord, "donor", sourceRecordId),
        {
          id: getFormBackfillRecordId("donor", sourceRecordId),
          createdAt,
          sourceRecordId
        }
      );
      await saveJsonRecord(env, getAdminDonorKey(donorRecord.id), donorRecord);
      donorSourceRecordIds.add(sourceRecordId);
      nextDonorRecords.push(donorRecord);
      createdDonors += 1;
    }
  }

  return {
    createdMembers,
    createdDonors,
    memberRecords: sortNewestFirst(nextMemberRecords, "updatedAt"),
    donorRecords: sortNewestFirst(nextDonorRecords, "updatedAt")
  };
};

const getDecodedPathParam = (value) => {
  try {
    return decodeURIComponent(value || "");
  } catch (error) {
    return "";
  }
};

const getMemberRouteMatch = (pathname) => pathname.match(/^\/admin\/members\/([^/]+)\/?$/);
const getDonorRouteMatch = (pathname) => pathname.match(/^\/admin\/donors\/([^/]+)\/?$/);
const getInboxActionRouteMatch = (pathname) => pathname.match(/^\/admin\/inbox\/([^/]+)\/([^/]+)\/?$/);
const getAdminContentPageRouteMatch = (pathname) => pathname.match(/^\/admin\/content\/pages\/([^/]+)\/?$/);
const getAdminContentPublishRouteMatch = (pathname) => pathname.match(/^\/admin\/content\/pages\/([^/]+)\/publish\/?$/);
const getPublicContentPageRouteMatch = (pathname) => pathname.match(/^\/content\/pages\/([^/]+)\/?$/);
const getAdminMailMessageRouteMatch = (pathname) => pathname.match(/^\/admin\/mail\/messages\/([^/]+)\/?$/);
const getAdminMailMessageStateRouteMatch = (pathname) => pathname.match(/^\/admin\/mail\/messages\/([^/]+)\/(read|unread)\/?$/);

const buildConversionPayloadFromSourceRecord = (record, target, sourceRecordId) => {
  const fields = record?.fields || {};
  const email = sanitizeText(fields.email ?? record?.email, 254);
  const firstName = sanitizeText(fields.first_name, 100);
  const lastName = sanitizeText(fields.last_name, 100);
  const sourceTimestamp = sanitizeText(record?.submittedAt ?? record?.createdAt, 64) || new Date().toISOString();

  if (target === "member") {
    return {
      source: "form-conversion",
      sourceRecordId,
      firstName,
      lastName,
      name: buildDisplayName("", firstName, lastName, email || "Member record"),
      email,
      phone: sanitizeText(fields.phone, 64),
      street: sanitizeText(fields.street, 160),
      city: sanitizeText(fields.city, 100),
      state: sanitizeText(fields.state, 40),
      zip: sanitizeText(fields.zip, 20),
      joinDate: toIsoDateOnly(sourceTimestamp),
      status: hasMeaningfulFieldValue(fields.comments) ? "pending" : "active",
      notes: sanitizeText(fields.comments, 4000)
    };
  }

  const donorNotes = [
    sanitizeText(fields.comments, 1200),
    sanitizeText(fields.special_instructions, 1200),
    fields.designation ? `Designation: ${sanitizeText(fields.designation, 120)}` : "",
    fields.tribute_name ? `Tribute: ${sanitizeText(fields.tribute_name, 120)}` : ""
  ]
    .filter(Boolean)
    .join("\n");

  return {
    source: "form-conversion",
    sourceRecordId,
    firstName,
    lastName,
    name: buildDisplayName("", firstName, lastName, email || "Donor record"),
    email,
    phone: sanitizeText(fields.phone, 64),
    amount: fields.donation_amount,
    donationDate: toIsoDateOnly(sourceTimestamp),
    paymentStatus: "submitted",
    frequency: sanitizeText(fields.donation_frequency, 60),
    notes: donorNotes
  };
};

const normalizeRecipientEmails = (value) => {
  const rawList = Array.isArray(value)
    ? value
    : String(value || "")
      .split(/[,\n;]/g)
      .map((entry) => entry.trim());

  const valid = rawList
    .map((entry) => normalizeEmail(entry))
    .filter((entry) => isValidEmail(entry));

  return uniqueValues(valid);
};

const sendZohoMessage = async (env, connection, origin, messagePayload) => {
  const accountId = sanitizeText(connection?.accountId, 200);
  if (!accountId) {
    throw new Error("Zoho account ID is missing. Reconnect Zoho from admin.");
  }

  const route = `${sanitizeText(connection.mailBaseUrl, 500).replace(/\/+$/, "")}/api/accounts/${encodeURIComponent(accountId)}/messages`;
  const requestBody = {
    fromAddress: sanitizeText(messagePayload?.fromAddress, 254),
    toAddress: sanitizeText(messagePayload?.toAddress, 5000),
    ccAddress: sanitizeText(messagePayload?.ccAddress, 5000),
    bccAddress: sanitizeText(messagePayload?.bccAddress, 5000),
    subject: sanitizeText(messagePayload?.subject, 300),
    content: sanitizeText(messagePayload?.content, 200000),
    mailFormat: sanitizeText(messagePayload?.mailFormat, 20) || "plaintext",
    askReceipt: "no"
  };

  return requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
    const activeRoute = `${sanitizeText(activeConnection.mailBaseUrl, 500).replace(/\/+$/, "")}/api/accounts/${encodeURIComponent(accountId)}/messages`;
    return callZohoApi(activeRoute || route, accessToken, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });
  });
};

const normalizeMailListLimit = (value, fallback = 25) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(200, parsed));
};

const normalizeMailListStart = (value, fallback = 1) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, parsed);
};

const normalizeZohoMessages = (value) => {
  return Array.isArray(value) ? value : [];
};

const mapZohoFolderRecord = (folder = {}, fallbackName = "Folder") => {
  const folderId = sanitizeText(folder?.folderId, 120);
  const folderName = sanitizeText(folder?.folderName, 160) || sanitizeText(folder?.path, 160) || fallbackName;
  return {
    folderId,
    folderName,
    folderType: sanitizeText(folder?.folderType, 80) || "Inbox",
    path: sanitizeText(folder?.path, 240),
    isArchived: Number(folder?.isArchived || 0) === 1,
    source: sanitizeText(folder?.source, 40) || "zoho"
  };
};

const mapZohoMessageRecord = (message = {}) => {
  const messageId = sanitizeText(message?.messageId, 120);
  const folderId = sanitizeText(message?.folderId, 120);
  const subject = sanitizeText(message?.subject, 500) || "(No subject)";
  const summary = sanitizeText(message?.summary, 5000);
  const fromAddress = sanitizeText(message?.fromAddress || message?.sender, 500);
  const toAddress = sanitizeText(message?.toAddress, 5000);
  const ccAddress = sanitizeText(message?.ccAddress, 5000);
  const threadId = sanitizeText(message?.threadId, 120);
  const hasAttachment = String(message?.hasAttachment || "0") === "1";
  const isUnread = String(message?.status || "") === "1";
  const receivedTime = Number.parseInt(String(message?.receivedTime || ""), 10);
  const sentDateInGMT = Number.parseInt(String(message?.sentDateInGMT || ""), 10);

  return {
    messageId,
    folderId,
    threadId,
    subject,
    summary,
    fromAddress,
    sender: sanitizeText(message?.sender, 500) || fromAddress,
    toAddress,
    ccAddress,
    hasAttachment,
    isUnread,
    priority: sanitizeText(message?.priority, 20),
    flagId: sanitizeText(message?.flagid, 40),
    receivedAt: Number.isFinite(receivedTime) && receivedTime > 0 ? new Date(receivedTime).toISOString() : "",
    sentAt: Number.isFinite(sentDateInGMT) && sentDateInGMT > 0 ? new Date(sentDateInGMT).toISOString() : "",
    raw: message
  };
};

const getZohoAccountMessagesBase = (connection) => {
  const accountId = sanitizeText(connection?.accountId, 200);
  if (!accountId) {
    throw new Error("Zoho account ID is missing. Reconnect Zoho from admin.");
  }
  return `${sanitizeText(connection.mailBaseUrl, 500).replace(/\/+$/, "")}/api/accounts/${encodeURIComponent(accountId)}`;
};

const fetchZohoMailFolders = async (env, connection, origin) => {
  return requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
    return callZohoApi(`${getZohoAccountMessagesBase(activeConnection)}/folders`, accessToken);
  });
};

const fetchZohoMailMessages = async (env, connection, origin, query = {}) => {
  const folderId = sanitizeText(query?.folderId, 120);
  const status = sanitizeText(query?.status, 20).toLowerCase();
  const start = normalizeMailListStart(query?.start, 1);
  const limit = normalizeMailListLimit(query?.limit, 25);

  return requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
    const url = new URL(`${getZohoAccountMessagesBase(activeConnection)}/messages/view`);
    if (folderId) url.searchParams.set("folderId", folderId);
    if (status === "read" || status === "unread" || status === "all") {
      url.searchParams.set("status", status);
    }
    url.searchParams.set("start", String(start));
    url.searchParams.set("limit", String(limit));
    return callZohoApi(url.toString(), accessToken);
  });
};

const fetchZohoMessageContent = async (env, connection, origin, folderId, messageId) => {
  return requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
    const base = getZohoAccountMessagesBase(activeConnection);
    const encodedFolderId = encodeURIComponent(folderId);
    const encodedMessageId = encodeURIComponent(messageId);

    const [headerPayload, contentPayload, attachmentPayload] = await Promise.all([
      callZohoApi(`${base}/folders/${encodedFolderId}/messages/${encodedMessageId}/header`, accessToken),
      callZohoApi(`${base}/folders/${encodedFolderId}/messages/${encodedMessageId}/content`, accessToken),
      callZohoApi(`${base}/folders/${encodedFolderId}/messages/${encodedMessageId}/attachmentinfo`, accessToken)
    ]);

    return {
      headerPayload,
      contentPayload,
      attachmentPayload
    };
  });
};

const updateZohoMessageReadState = async (env, connection, origin, messageId, mode) => {
  return requestZohoWithRefresh(env, connection, origin, async (accessToken, activeConnection) => {
    const route = `${getZohoAccountMessagesBase(activeConnection)}/updatemessage`;
    return callZohoApi(route, accessToken, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mode,
        messageId: [messageId]
      })
    });
  });
};

const fetchFolderIdForMessage = async (env, connection, origin, messageId) => {
  const lookup = await fetchZohoMailMessages(env, connection, origin, { start: 1, limit: 200 });
  const messages = normalizeZohoMessages(lookup?.payload?.data);
  const match = messages.find((entry) => sanitizeText(entry?.messageId, 120) === sanitizeText(messageId, 120));
  return sanitizeText(match?.folderId, 120);
};

const handleAdminMailFolders = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }
  const activeConnection = await ensureZohoSenderProfile(env, connection, origin);
  let folders = [];
  let scopeWarning = "";

  try {
    const folderResult = await fetchZohoMailFolders(env, activeConnection, origin);
    folders = normalizeZohoMessages(folderResult?.payload?.data).map((folder) => mapZohoFolderRecord(folder));
  } catch (error) {
    const message = sanitizeText(error?.message, 400).toLowerCase();
    if (message.includes("oauthscope")) {
      scopeWarning = "Folder list requires ZohoMail.folders.READ scope. Reconnect Zoho after scope expansion.";
    } else if (Number(error?.status) === 401 || message === "401") {
      scopeWarning = "Zoho folder API returned 401. Trying message-derived folders.";
    } else {
      console.error("Zoho folder list failed", error?.status || "", error?.message || error);
      const detail = sanitizeText(error?.message, 200);
      scopeWarning = detail
        ? `Folder list could not be loaded (${detail}). Trying message-derived folders.`
        : "Folder list could not be loaded. Trying message-derived folders.";
    }
  }

  if (!folders.length) {
    try {
      const messageResult = await fetchZohoMailMessages(env, activeConnection, origin, { start: 1, limit: 50 });
      const messages = normalizeZohoMessages(messageResult?.payload?.data);
      const folderIds = uniqueValues(messages.map((message) => sanitizeText(message?.folderId, 120)).filter(Boolean));
      folders = folderIds.map((folderId, index) =>
        mapZohoFolderRecord(
          {
            folderId,
            folderName: index === 0 ? "Inbox" : `Folder ${index + 1}`,
            folderType: index === 0 ? "Inbox" : "Unknown",
            path: index === 0 ? "/Inbox" : `/Folder-${index + 1}`,
            source: "derived"
          },
          "Inbox"
        )
      );
    } catch (error) {
      console.error("Zoho folder fallback via messages failed", error?.status || "", error?.message || error);
      const detail = sanitizeText(error?.message, 200);
      const fallbackWarning = detail
        ? `Folder fallback could not load (${detail}).`
        : "Folder fallback could not load.";
      scopeWarning = scopeWarning ? `${scopeWarning} ${fallbackWarning}` : fallbackWarning;
      folders = [];
    }
  }

  return json(
    {
      ok: true,
      folders,
      scopeWarning
    },
    200,
    origin || "*"
  );
};

const handleAdminMailMessages = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }

  const url = new URL(request.url);
  const folderId = sanitizeText(url.searchParams.get("folderId"), 120);
  const status = sanitizeText(url.searchParams.get("status"), 20).toLowerCase();
  const start = normalizeMailListStart(url.searchParams.get("start"), 1);
  const limit = normalizeMailListLimit(url.searchParams.get("limit"), 25);
  const search = sanitizeText(url.searchParams.get("search"), 200).toLowerCase();

  try {
    const result = await fetchZohoMailMessages(env, connection, origin, { folderId, status, start, limit });
    const messages = normalizeZohoMessages(result?.payload?.data).map((message) => mapZohoMessageRecord(message));
    const filtered = search
      ? messages.filter((message) =>
        [
          message.subject,
          message.summary,
          message.fromAddress,
          message.toAddress
        ]
          .join(" ")
          .toLowerCase()
          .includes(search)
      )
      : messages;

    return json(
      {
        ok: true,
        folderId,
        start,
        limit,
        status: status || "all",
        count: filtered.length,
        messages: filtered
      },
      200,
      origin || "*"
    );
  } catch (error) {
    console.error("Zoho message list failed", error?.status || "", error?.message || error);
    return json({ error: error?.message || "Unable to load mailbox messages." }, 502, origin || "*");
  }
};

const handleAdminMailMessageGet = async (request, env, origin, messageIdParam) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }

  const messageId = sanitizeText(messageIdParam, 120);
  if (!messageId) {
    return json({ error: "Message ID is required." }, 400, origin || "*");
  }

  const url = new URL(request.url);
  let folderId = sanitizeText(url.searchParams.get("folderId"), 120);
  if (!folderId) {
    folderId = await fetchFolderIdForMessage(env, connection, origin, messageId);
  }
  if (!folderId) {
    return json({ error: "Folder ID is required to load this message." }, 400, origin || "*");
  }

  try {
    const result = await fetchZohoMessageContent(env, connection, origin, folderId, messageId);
    const headerContent = result?.payload?.headerPayload?.data?.headerContent;
    const content = sanitizeText(result?.payload?.contentPayload?.data?.content, 200000);
    const attachments = Array.isArray(result?.payload?.attachmentPayload?.data?.attachments)
      ? result.payload.attachmentPayload.data.attachments
      : [];

    return json(
      {
        ok: true,
        messageId,
        folderId,
        headerContent,
        content,
        attachments
      },
      200,
      origin || "*"
    );
  } catch (error) {
    console.error("Zoho message fetch failed", error?.status || "", error?.message || error);
    return json({ error: error?.message || "Unable to load the selected message." }, 502, origin || "*");
  }
};

const handleAdminMailMessageReadState = async (request, env, origin, messageIdParam, stateAction = "read") => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }

  const messageId = sanitizeText(messageIdParam, 120);
  if (!messageId) {
    return json({ error: "Message ID is required." }, 400, origin || "*");
  }

  const mode = stateAction === "unread" ? "markAsUnread" : "markAsRead";

  try {
    await updateZohoMessageReadState(env, connection, origin, messageId, mode);
    return json({ ok: true, messageId, mode }, 200, origin || "*");
  } catch (error) {
    console.error("Zoho message read-state update failed", error?.status || "", error?.message || error);
    return json(
      {
        error: error?.message || "Unable to update message state.",
        scopeHint: "This action needs ZohoMail.messages.UPDATE or ZohoMail.messages.ALL scope."
      },
      502,
      origin || "*"
    );
  }
};

const handleAdminMailSend = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }
  const activeConnection = await ensureZohoSenderProfile(env, connection, origin);

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  const toRecipients = normalizeRecipientEmails(payload?.toEmails || payload?.toAddress);
  const ccRecipients = normalizeRecipientEmails(payload?.ccEmails || payload?.ccAddress);
  const bccRecipients = normalizeRecipientEmails(payload?.bccEmails || payload?.bccAddress);
  const subject = sanitizeText(payload?.subject, 300);
  const content = sanitizeText(payload?.content, 200000);
  const fromAddress = resolveZohoFromAddress(env, activeConnection);

  if (!toRecipients.length) {
    return json({ error: "At least one recipient is required." }, 400, origin || "*");
  }
  if (!subject) {
    return json({ error: "Email subject is required." }, 400, origin || "*");
  }
  if (!content) {
    return json({ error: "Email body is required." }, 400, origin || "*");
  }
  if (!isValidEmail(fromAddress)) {
    return json({ error: "No valid Zoho sender address is available. Reconnect Zoho and retry." }, 400, origin || "*");
  }

  try {
    const result = await sendZohoMessage(env, activeConnection, origin, {
      fromAddress,
      toAddress: toRecipients.join(","),
      ccAddress: ccRecipients.join(","),
      bccAddress: bccRecipients.join(","),
      subject,
      content,
      mailFormat: sanitizeText(payload?.mailFormat, 20) || "html"
    });

    await writeAuditLog(env, verified.user, "message_sent_manual", {
      toCount: toRecipients.length,
      ccCount: ccRecipients.length,
      bccCount: bccRecipients.length,
      subject
    });

    return json(
      {
        ok: true,
        subject,
        toCount: toRecipients.length,
        messageId: sanitizeText(result?.payload?.data?.messageId, 120)
      },
      200,
      origin || "*"
    );
  } catch (error) {
    console.error("Zoho manual send failed", error?.status || "", error?.message || error);
    return json({ error: error?.message || "Unable to send email." }, 502, origin || "*");
  }
};

const handleAdminMailReply = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }
  const activeConnection = await ensureZohoSenderProfile(env, connection, origin);

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  const messageId = sanitizeText(payload?.messageId, 120);
  const toRecipients = normalizeRecipientEmails(payload?.toEmails || payload?.toAddress);
  const ccRecipients = normalizeRecipientEmails(payload?.ccEmails || payload?.ccAddress);
  const bccRecipients = normalizeRecipientEmails(payload?.bccEmails || payload?.bccAddress);
  const subject = sanitizeText(payload?.subject, 300);
  const content = sanitizeText(payload?.content, 200000);
  const fromAddress = resolveZohoFromAddress(env, activeConnection);

  if (!messageId) {
    return json({ error: "Original message ID is required for replies." }, 400, origin || "*");
  }
  if (!toRecipients.length) {
    return json({ error: "At least one reply recipient is required." }, 400, origin || "*");
  }
  if (!content) {
    return json({ error: "Reply content is required." }, 400, origin || "*");
  }
  if (!isValidEmail(fromAddress)) {
    return json({ error: "No valid Zoho sender address is available. Reconnect Zoho and retry." }, 400, origin || "*");
  }

  try {
    const replyResult = await requestZohoWithRefresh(env, activeConnection, origin, async (accessToken, connectedRecord) => {
      const route = `${getZohoAccountMessagesBase(connectedRecord)}/messages/${encodeURIComponent(messageId)}`;
      return callZohoApi(route, accessToken, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fromAddress,
          toAddress: toRecipients.join(","),
          ccAddress: ccRecipients.join(","),
          bccAddress: bccRecipients.join(","),
          subject,
          content,
          askReceipt: "no",
          action: "reply",
          mailFormat: sanitizeText(payload?.mailFormat, 20) || "html"
        })
      });
    });

    await writeAuditLog(env, verified.user, "message_replied_manual", {
      messageId,
      toCount: toRecipients.length,
      subject
    });

    return json(
      {
        ok: true,
        messageId: sanitizeText(replyResult?.payload?.data?.messageId, 120),
        originalMessageId: messageId
      },
      200,
      origin || "*"
    );
  } catch (error) {
    console.error("Zoho reply failed", error?.status || "", error?.message || error);
    return json({ error: error?.message || "Unable to send reply." }, 502, origin || "*");
  }
};

const handleAdminMailStatus = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  const connected = Boolean(
    connection &&
    connection.status === "connected" &&
    sanitizeText(connection.accountId, 200) &&
    sanitizeSecretText(connection.encryptedRefreshToken, 12000)
  );
  const canManageIntegration = adminHasRole(verified.user, ["owner", "admin"]);
  const effectiveFromAddress = resolveZohoFromAddress(env, connection);

  return json(
    {
      ok: true,
      configured: hasZohoCoreConfig(env),
      connected,
      canManageIntegration,
      mailboxEmail: sanitizeText(connection?.mailboxEmail, 254),
      accountId: sanitizeText(connection?.accountId, 200),
      connectedAt: sanitizeText(connection?.createdAt, 64),
      updatedAt: sanitizeText(connection?.updatedAt, 64),
      callbackUrl: sanitizeText(connection?.redirectUri, 600) || getZohoRedirectUri(env, origin),
      fromAddress: effectiveFromAddress,
      configuredFromAddress: normalizeEmail(getZohoFromAddress(env)),
      allowedFromAddresses: Array.isArray(connection?.allowedFromAddresses)
        ? connection.allowedFromAddresses.slice(0, 20).map((value) => normalizeEmail(value)).filter((value) => isValidEmail(value))
        : [],
      maxNewsletterRecipients: ZOHO_NEWSLETTER_MAX_RECIPIENTS
    },
    200,
    origin || "*"
  );
};

const handleAdminMailConnect = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  if (!adminHasRole(verified.user, ["owner", "admin"])) {
    return json({ error: "Only owner or admin can connect Zoho." }, 403, origin || "*");
  }

  if (!hasZohoCoreConfig(env)) {
    return json(
      {
        error: "Zoho is not configured yet. Add ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, and ZOHO_TOKEN_ENCRYPTION_KEY as secrets."
      },
      400,
      origin || "*"
    );
  }

  try {
    const url = new URL(request.url);
    const returnPath = normalizeZohoAdminReturnPath(
      sanitizeText(url.searchParams.get("returnTo"), 800) || sanitizeText(url.searchParams.get("returnPath"), 800)
    );
    const state = await buildZohoOauthState(env, verified.user, origin, returnPath);
    const authorizeUrl = buildZohoAuthorizeUrl(env, origin, state);
    return json({ ok: true, authorizeUrl }, 200, origin || "*");
  } catch (error) {
    console.error("Zoho connect URL generation failed", error?.message || error);
    return json({ error: "Unable to prepare the Zoho connection URL." }, 500, origin || "*");
  }
};

const handleAdminMailCallback = async (request, env, origin) => {
  const wantsHtml = (request.headers.get("Accept") || "").includes("text/html");
  const respondError = (message, status = 400, returnOrigin = origin, returnPath = "") => {
    if (wantsHtml) {
      return Response.redirect(buildZohoAdminReturnUrl(env, returnOrigin, "error", message, returnPath), 302);
    }
    return json({ error: message }, status, origin || "*");
  };

  const respondSuccess = (payload, returnOrigin = origin, returnPath = "") => {
    if (wantsHtml) {
      return Response.redirect(buildZohoAdminReturnUrl(env, returnOrigin, "connected", "", returnPath), 302);
    }
    return json(payload, 200, origin || "*");
  };

  if (!hasZohoCoreConfig(env)) {
    return respondError("Zoho is not configured yet.", 400);
  }

  const url = new URL(request.url);
  const code = sanitizeSecretText(url.searchParams.get("code"), 4000);
  const state = sanitizeSecretText(url.searchParams.get("state"), 4000);
  const oauthError = sanitizeText(url.searchParams.get("error"), 200);

  if (oauthError) {
    return respondError(`Zoho OAuth error: ${oauthError}`, 400);
  }

  if (!code || !state) {
    return respondError("Missing OAuth callback code or state.", 400);
  }

  const verifiedState = await verifyZohoOauthState(env, state);
  if (verifiedState.error) {
    return respondError(verifiedState.error, 400);
  }

  let oauthOrigin = origin;
  let oauthReturnPath = DEFAULT_ZOHO_ADMIN_RETURN_PATH;
  const oauthRedirectUri = sanitizeText(verifiedState?.payload?.redirectUri, 600);
  oauthReturnPath = normalizeZohoAdminReturnPath(verifiedState?.payload?.returnPath);
  try {
    const parsed = new URL(oauthRedirectUri);
    oauthOrigin = parsed.origin;
  } catch (error) {
    oauthOrigin = origin;
  }

  const adminUser = await loadAdminUserByEmail(env, normalizeAdminEmail(verifiedState.payload.email));
  if (!adminUser) {
    return respondError("Admin user for this OAuth session was not found.", 400, oauthOrigin, oauthReturnPath);
  }

  try {
    const tokenPayload = await requestZohoToken(env, origin, {
      grant_type: "authorization_code",
      code
    }, oauthRedirectUri);
    const accountsResult = await loadZohoAccountsWithFallback(
      env,
      tokenPayload,
      sanitizeSecretText(tokenPayload.access_token, 4000)
    );
    const accountsPayload = accountsResult.payload;
    const accounts = parseZohoAccountsList(accountsPayload);
    const selectedAccount = resolveZohoAccountRecord(
      accounts,
      getZohoMailAccountId(env),
      getZohoFromAddress(env)
    );
    if (!selectedAccount) {
      return respondError(
        "Zoho connected, but no mailbox account was returned. Confirm account access in Zoho Mail.",
        400,
        oauthOrigin,
        oauthReturnPath
      );
    }

    const connectionRecord = await buildZohoConnectionRecord(
      env,
      tokenPayload,
      origin,
      selectedAccount,
      adminUser,
      oauthRedirectUri,
      accountsResult.mailBaseUrl
    );
    await saveZohoConnection(env, connectionRecord);
    await writeAuditLog(env, adminUser, "zoho_connected", {
      mailboxEmail: connectionRecord.mailboxEmail,
      accountId: connectionRecord.accountId
    });

    return respondSuccess({
      ok: true,
      connected: true,
      mailboxEmail: connectionRecord.mailboxEmail,
      accountId: connectionRecord.accountId
    }, oauthOrigin, oauthReturnPath);
  } catch (error) {
    console.error("Zoho callback failed", error?.status || "", error?.message || error);
    return respondError(error?.message || "Unable to complete Zoho connection.", 502, oauthOrigin, oauthReturnPath);
  }
};

const handleAdminMailSendTest = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }
  const activeConnection = await ensureZohoSenderProfile(env, connection, origin);

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  const requestedRecipients = Array.isArray(payload?.toEmails)
    ? payload.toEmails
    : [payload?.toEmail || verified.user.email];
  const recipients = normalizeRecipientEmails(requestedRecipients);

  if (!recipients.length) {
    return json({ error: "A valid test recipient email is required." }, 400, origin || "*");
  }
  if (recipients.length > ZOHO_TEST_MAX_RECIPIENTS) {
    return json(
      { error: `Test email supports up to ${ZOHO_TEST_MAX_RECIPIENTS} recipients per send.` },
      400,
      origin || "*"
    );
  }

  const subject = sanitizeText(payload?.subject, 300) || "Friends of WDAC test email";
  const content = sanitizeText(payload?.content, 200000) || "This is a test email from the Friends of WDAC admin.";
  const fromAddress = resolveZohoFromAddress(env, activeConnection);
  if (!isValidEmail(fromAddress)) {
    return json({ error: "No valid Zoho sender address is available. Reconnect Zoho and retry." }, 400, origin || "*");
  }
  const successes = [];
  const failures = [];

  try {
    for (const recipient of recipients) {
      try {
        await sendZohoMessage(env, activeConnection, origin, {
          // Zoho requires fromAddress to match one of the authenticated account's send identities.
          fromAddress,
          toAddress: recipient,
          subject,
          content,
          mailFormat: "plaintext"
        });
        successes.push(recipient);
      } catch (error) {
        failures.push({
          email: recipient,
          message: sanitizeText(error?.message, 300) || "Send failed"
        });
      }
    }

    if (!successes.length) {
      const firstFailure = failures[0]?.message || "Unable to send the test email.";
      return json({ error: firstFailure, sentTo: [], failureCount: failures.length, failures }, 502, origin || "*");
    }

    await writeAuditLog(env, verified.user, "message_sent_test", {
      recipients: successes,
      subject
    });

    return json(
      {
        ok: true,
        sentTo: successes,
        failureCount: failures.length,
        failures,
        subject
      },
      200,
      origin || "*"
    );
  } catch (error) {
    console.error("Zoho test send failed", error?.status || "", error?.message || error);
    return json({ error: error?.message || "Unable to send the test email." }, 502, origin || "*");
  }
};

const handleAdminMailSendNewsletter = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  if (!adminHasRole(verified.user, ["owner", "admin"])) {
    return json({ error: "Only owner or admin can send newsletters." }, 403, origin || "*");
  }

  const connection = await loadZohoConnection(env);
  if (!connection || connection.status !== "connected") {
    return json({ error: "Zoho is not connected yet. Connect Zoho first." }, 400, origin || "*");
  }
  const activeConnection = await ensureZohoSenderProfile(env, connection, origin);

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const subject = sanitizeText(payload?.subject, 300);
  const content = sanitizeText(payload?.content, 200000);
  const recipients = normalizeRecipientEmails(payload?.recipients);
  const audience = sanitizeText(payload?.audience, 40);

  if (!subject) {
    return json({ error: "Newsletter subject is required." }, 400, origin || "*");
  }
  if (!content) {
    return json({ error: "Newsletter body is required." }, 400, origin || "*");
  }
  if (!recipients.length) {
    return json({ error: "At least one recipient email is required." }, 400, origin || "*");
  }
  if (recipients.length > ZOHO_NEWSLETTER_MAX_RECIPIENTS) {
    return json(
      {
        error: `This route currently allows up to ${ZOHO_NEWSLETTER_MAX_RECIPIENTS} recipients per send.`
      },
      400,
      origin || "*"
    );
  }

  const fromAddress = resolveZohoFromAddress(env, activeConnection);
  if (!isValidEmail(fromAddress)) {
    return json({ error: "No valid Zoho sender address is available. Reconnect Zoho and retry." }, 400, origin || "*");
  }
  const successes = [];
  const failures = [];

  for (const recipient of recipients) {
    try {
      await sendZohoMessage(env, activeConnection, origin, {
        fromAddress,
        toAddress: recipient,
        subject,
        content,
        mailFormat: "plaintext"
      });
      successes.push(recipient);
    } catch (error) {
      failures.push({
        recipient,
        error: sanitizeText(error?.message || "Send failed", 300)
      });
    }
  }

  await writeAuditLog(env, verified.user, "newsletter_sent", {
    audience,
    requestedRecipients: recipients.length,
    successCount: successes.length,
    failureCount: failures.length
  });

  if (!successes.length) {
    return json(
      {
        error: "Newsletter send failed for all recipients.",
        failures
      },
      502,
      origin || "*"
    );
  }

  return json(
    {
      ok: true,
      requestedRecipients: recipients.length,
      successCount: successes.length,
      failureCount: failures.length,
      failures
    },
    200,
    origin || "*"
  );
};

const handleAdminStatus = async (env, origin) => {
  const allowedAdminEmails = getAllowedAdminEmails(env);
  const configuredUsers = await loadConfiguredAllowedAdminUsers(env);

  return json(
    {
      ok: true,
      signupEnabled: true,
      passwordResetEnabled: Boolean(getAdminResetMailers(env).length && getAdminResetSecret(env)),
      allowedAdminCount: allowedAdminEmails.length,
      configuredAdminCount: configuredUsers.length
    },
    200,
    origin || "*"
  );
};

const handleAdminSignup = async (request, env, origin) => {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const email = normalizeAdminEmail(payload?.email);
  const password = sanitizeSecretText(payload?.password, 512);

  if (!isValidEmail(email)) {
    return json({ error: "A valid admin email is required." }, 400, origin || "*");
  }

  if (!isAllowedAdminEmail(env, email)) {
    return json({ error: "This email is not approved for admin access." }, 403, origin || "*");
  }

  const passwordError = validateAdminPassword(password);
  if (passwordError) {
    return json({ error: passwordError }, 400, origin || "*");
  }

  const existingUser = await loadAdminUserByEmail(env, email);
  if (existingUser) {
    return json({ error: "An admin account already exists for this email. Sign in instead." }, 409, origin || "*");
  }

  let passwordHash;
  try {
    passwordHash = await createPasswordHashRecord(password);
  } catch (error) {
    console.error("Admin signup password hash failed", error?.message || error);
    return json({ error: "Unable to prepare the admin password." }, 500, origin || "*");
  }
  const now = new Date().toISOString();
  const user = {
    email,
    role: "admin",
    createdAt: now,
    updatedAt: now,
    passwordUpdatedAt: now,
    passwordHash
  };

  await saveAdminUser(env, user);

  try {
    const session = await createAdminToken(env, user);
    return json({ ok: true, ...session, user: { email: user.email } }, 200, origin || "*");
  } catch (error) {
    return json({ error: "Admin session secret is not configured" }, 500, origin || "*");
  }
};

const handleAdminRequestPasswordReset = async (request, env, origin) => {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const email = normalizeAdminEmail(payload?.email);
  if (!isValidEmail(email)) {
    return json({ error: "Enter a valid email address." }, 400, origin || "*");
  }

  const genericSuccess = json(
    {
      ok: true,
      requestedEmail: email,
      message: `If ${email} can reset this admin account, we sent a reset link there.`
    },
    200,
    origin || "*"
  );

  if (!isAllowedAdminEmail(env, email)) {
    return genericSuccess;
  }

  const user = await loadAdminUserByEmail(env, email);
  if (!user) {
    return json(
      {
        error: "No admin account exists for this email yet. Use Create account first, then request a reset link.",
        signupAvailable: true
      },
      404,
      origin || "*"
    );
  }

  const resetMailers = getAdminResetMailers(env);
  const sender = getAdminResetSender(env);
  if (!resetMailers.length || !isValidEmail(sender)) {
    return json({ error: "Password reset email is not configured yet." }, 500, origin || "*");
  }

  let resetToken;
  try {
    resetToken = await createAdminResetToken(env, user);
  } catch (error) {
    console.error("Admin reset token failed", error?.message || error);
    return json({ error: "Password reset is not configured yet." }, 500, origin || "*");
  }

  const resetKey = getAdminResetKey(resetToken.tokenId);
  const resetRecord = {
    email,
    createdAt: new Date().toISOString(),
    expiresAt: resetToken.expiresAt
  };

  await env.SUBSCRIBERS.put(resetKey, JSON.stringify(resetRecord), {
    expirationTtl: ADMIN_RESET_TTL_SECONDS
  });

  const resetUrl = buildAdminResetUrl(env, origin, resetToken.token);
  const subject = "Reset your Friends of WDAC admin password";
  const textBody = [
    "A request was made to reset your Friends of WDAC admin password.",
    "",
    `Reset link: ${resetUrl}`,
    "",
    "This link expires in 30 minutes. If you did not request this, you can ignore this email."
  ].join("\n");
  const htmlBody = `
    <h1>Reset your admin password</h1>
    <p>A request was made to reset your Friends of WDAC admin password.</p>
    <p><a href="${escapeHtml(resetUrl)}">Open the password reset page</a></p>
    <p>This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
  `;

  let sentBinding = "";
  let lastSendError = null;

  for (const mailerEntry of resetMailers) {
    try {
      await mailerEntry.binding.send({
        to: email,
        from: { email: sender, name: "Friends of WDAC Admin" },
        replyTo: { email: sender, name: "Friends of WDAC Admin" },
        subject,
        text: textBody,
        html: htmlBody
      });
      sentBinding = mailerEntry.name;
      break;
    } catch (error) {
      lastSendError = error;
      console.error(
        `Admin password reset email failed via ${mailerEntry.name}`,
        error?.code || "",
        error?.message || error
      );
    }
  }

  if (!sentBinding) {
    const recipientNotAllowed = String(lastSendError?.code || "").toUpperCase() === "E_RECIPIENT_NOT_ALLOWED";
    if (recipientNotAllowed) {
      return json(
        {
          error: "Unable to send the reset email right now. The destination is blocked by current email binding allowlist settings."
        },
        500,
        origin || "*"
      );
    }
    return json({ error: "Unable to send the reset email right now." }, 500, origin || "*");
  }

  console.log(`Admin password reset email delivered via ${sentBinding} to ${email}.`);
  return genericSuccess;
};

const handleAdminLogin = async (request, env, origin) => {
  if (!(await adminUsersExist(env))) {
    return json({ error: "No admin account has been created yet. Use Sign up first.", signupAvailable: true }, 404, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const email = normalizeAdminEmail(payload?.email);
  const password = sanitizeSecretText(payload?.password, 512);

  if (!isValidEmail(email) || !password) {
    return json({ error: "Email and password are required." }, 400, origin || "*");
  }

  if (!isAllowedAdminEmail(env, email)) {
    return json({ error: "This email is not approved for admin access." }, 403, origin || "*");
  }

  const user = await loadAdminUserByEmail(env, email);
  if (!user) {
    return json({ error: "No account exists for this email yet. Use Sign up first.", signupAvailable: true }, 404, origin || "*");
  }

  const matches = await verifyPasswordHash(password, user.passwordHash);
  if (!matches) {
    return json({ error: "Sign-in failed" }, 401, origin || "*");
  }

  try {
    const session = await createAdminToken(env, user);
    return json({ ok: true, ...session, user: { email: user.email } }, 200, origin || "*");
  } catch (error) {
    return json({ error: "Admin session secret is not configured" }, 500, origin || "*");
  }
};

const handleAdminResetPassword = async (request, env, origin) => {
  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const token = sanitizeSecretText(payload?.token, 4096);
  const newPassword = sanitizeSecretText(payload?.newPassword, 512);

  if (!token || !newPassword) {
    return json({ error: "Reset token and new password are required." }, 400, origin || "*");
  }

  const passwordError = validateAdminPassword(newPassword);
  if (passwordError) {
    return json({ error: passwordError }, 400, origin || "*");
  }

  const resetPayload = await verifyAdminResetToken(token, env);
  if (!resetPayload) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  const resetKey = getAdminResetKey(resetPayload.jti);
  const rawResetRecord = await env.SUBSCRIBERS.get(resetKey);
  if (!rawResetRecord) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  let resetRecord;
  try {
    resetRecord = JSON.parse(rawResetRecord);
  } catch (error) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  if (normalizeAdminEmail(resetRecord?.email) !== normalizeAdminEmail(resetPayload.email)) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  if (resetRecord?.usedAt) {
    return json({ error: "This reset link has already been used." }, 400, origin || "*");
  }

  const user = await loadAdminUserByEmail(env, normalizeAdminEmail(resetPayload.email));
  if (!user) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  if (getAdminPasswordTimestamp(user) !== sanitizeText(resetPayload.pwdAt, 64)) {
    return json({ error: "This reset link is invalid or has expired." }, 400, origin || "*");
  }

  const isSamePassword = await verifyPasswordHash(newPassword, user.passwordHash);
  if (isSamePassword) {
    return json({ error: "Choose a new password that differs from the current one." }, 400, origin || "*");
  }

  const now = new Date().toISOString();
  const updatedUser = {
    ...user,
    updatedAt: now,
    passwordUpdatedAt: now,
    passwordHash: await createPasswordHashRecord(newPassword)
  };

  await saveAdminUser(env, updatedUser);
  await env.SUBSCRIBERS.put(
    resetKey,
    JSON.stringify({
      ...resetRecord,
      usedAt: now
    }),
    {
      expirationTtl: 60 * 60 * 24
    }
  );

  try {
    const session = await createAdminToken(env, updatedUser);
    return json({ ok: true, ...session, user: { email: updatedUser.email } }, 200, origin || "*");
  } catch (error) {
    return json({ error: "Admin session secret is not configured" }, 500, origin || "*");
  }
};

const handleAdminChangePassword = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const currentPassword = sanitizeSecretText(payload?.currentPassword, 512);
  const newPassword = sanitizeSecretText(payload?.newPassword, 512);

  if (!currentPassword || !newPassword) {
    return json({ error: "Current password and new password are required." }, 400, origin || "*");
  }

  const currentMatches = await verifyPasswordHash(currentPassword, verified.user.passwordHash);
  if (!currentMatches) {
    return json({ error: "Current password is incorrect." }, 401, origin || "*");
  }

  const passwordError = validateAdminPassword(newPassword);
  if (passwordError) {
    return json({ error: passwordError }, 400, origin || "*");
  }

  const isSamePassword = await verifyPasswordHash(newPassword, verified.user.passwordHash);
  if (isSamePassword) {
    return json({ error: "Choose a new password that differs from the current one." }, 400, origin || "*");
  }

  const now = new Date().toISOString();
  const updatedUser = {
    ...verified.user,
    updatedAt: now,
    passwordUpdatedAt: now,
    passwordHash: await createPasswordHashRecord(newPassword)
  };

  await saveAdminUser(env, updatedUser);

  try {
    const session = await createAdminToken(env, updatedUser);
    return json({ ok: true, ...session, user: { email: updatedUser.email } }, 200, origin || "*");
  } catch (error) {
    return json({ error: "Admin session secret is not configured" }, 500, origin || "*");
  }
};

const handleAdminDashboard = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const url = new URL(request.url);
  const limit = toPositiveInteger(url.searchParams.get("limit"), 25, 100);
  const subscriberLimit = toPositiveInteger(url.searchParams.get("subscriberLimit"), 10, 50);

  const [formRecords, subscriberRecords] = await Promise.all([
    loadRecordsByPrefix(env, "form:"),
    loadRecordsByPrefix(env, "email:")
  ]);

  const syncedRecords = await syncAdminRecordsFromFormRecords(env, formRecords);

  const [peopleRecords, importRecords] = await Promise.all([
    loadAdminPeople(env),
    loadAdminImports(env)
  ]);
  const memberRecords = syncedRecords.memberRecords;
  const donorRecords = syncedRecords.donorRecords;

  const recentForms = sortNewestFirst(formRecords, "submittedAt").slice(0, limit);
  const recentSubscribers = sortNewestFirst(subscriberRecords, "createdAt").slice(0, subscriberLimit);

  return json(
    {
      ok: true,
      stats: summarizeStats(formRecords, subscriberRecords),
      recentForms,
      recentSubscribers,
      records: {
        people: peopleRecords.length,
        members: memberRecords.length,
        donors: donorRecords.length,
        imports: importRecords.length
      },
      session: {
        expiresAt: new Date(verified.session.exp).toISOString(),
        email: verified.user.email
      }
    },
    200,
    origin || "*"
  );
};

const handleAdminPeopleList = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const records = await loadAdminPeople(env);
  return json({ ok: true, count: records.length, records }, 200, origin || "*");
};

const handleAdminMembersList = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const formRecords = await loadRecordsByPrefix(env, "form:");
  const { memberRecords: records } = await syncAdminRecordsFromFormRecords(env, formRecords);
  const summary = {
    active: records.filter((record) => !/lapsed/i.test(record.status || "") && !/pending/i.test(record.status || "")).length,
    lapsed: records.filter((record) => /lapsed/i.test(record.status || "")).length,
    pending: records.filter((record) => /pending/i.test(record.status || "")).length
  };
  return json({ ok: true, count: records.length, summary, records }, 200, origin || "*");
};

const handleAdminCreateMember = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const record = await buildMemberRecord(env, payload);
  await saveJsonRecord(env, getAdminMemberKey(record.id), record);
  return json({ ok: true, record }, 201, origin || "*");
};

const handleAdminUpdateMember = async (request, env, origin, memberId) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const existing = await loadJsonRecord(env, getAdminMemberKey(memberId));
  if (!existing) {
    return json({ error: "Member record not found." }, 404, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const record = await buildMemberRecord(env, payload, existing);
  await saveJsonRecord(env, getAdminMemberKey(memberId), record);
  return json({ ok: true, record }, 200, origin || "*");
};

const handleAdminDonorsList = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const formRecords = await loadRecordsByPrefix(env, "form:");
  const { donorRecords: records } = await syncAdminRecordsFromFormRecords(env, formRecords);
  const summary = {
    paid: records.filter((record) => !/pledged|submitted|pending/i.test(record.paymentStatus || "")).length,
    pending: records.filter((record) => /pledged|submitted|pending/i.test(record.paymentStatus || "")).length,
    recurring: records.filter((record) => record.recurring).length
  };
  return json({ ok: true, count: records.length, summary, records }, 200, origin || "*");
};

const handleAdminCreateDonor = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const record = await buildDonorRecord(env, payload);
  await saveJsonRecord(env, getAdminDonorKey(record.id), record);
  return json({ ok: true, record }, 201, origin || "*");
};

const handleAdminUpdateDonor = async (request, env, origin, donorId) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const existing = await loadJsonRecord(env, getAdminDonorKey(donorId));
  if (!existing) {
    return json({ error: "Donor record not found." }, 404, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const record = await buildDonorRecord(env, payload, existing);
  await saveJsonRecord(env, getAdminDonorKey(donorId), record);
  return json({ ok: true, record }, 200, origin || "*");
};

const handleAdminImportsList = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const records = await loadAdminImports(env);
  return json({ ok: true, count: records.length, records }, 200, origin || "*");
};

const handleAdminCreateImportBatch = async (request, env, origin) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  const cleaned = sanitizeImportBatchPayload(payload);
  const importedPayloads = Array.isArray(payload?.records) ? payload.records.slice(0, 5000) : [];
  if (!["member", "donor"].includes(cleaned.entityType)) {
    return json({ error: "Import entityType must be member or donor." }, 400, origin || "*");
  }

  const now = new Date().toISOString();
  const record = {
    id: createRecordId(),
    type: "import-batch",
    createdAt: now,
    updatedAt: now,
    uploadedAt: cleaned.uploadedAt || now,
    ...cleaned,
    rowCount: Math.max(cleaned.rowCount || 0, importedPayloads.length),
    status: importedPayloads.length ? "imported" : cleaned.status
  };

  let importedCount = 0;

  if (importedPayloads.length) {
    if (cleaned.entityType === "member") {
      for (const [index, importedPayload] of importedPayloads.entries()) {
        const memberRecord = await buildMemberRecord(env, {
          ...importedPayload,
          source: sanitizeText(importedPayload?.source, 80) || "csv-import",
          sourceBatchId: record.id,
          sourceRecordId:
            sanitizeText(importedPayload?.sourceRecordId, 320) ||
            `${record.fileName || "member-import.csv"}#${index + 2}`
        });
        await saveJsonRecord(env, getAdminMemberKey(memberRecord.id), memberRecord);
        importedCount += 1;
      }
    } else {
      for (const [index, importedPayload] of importedPayloads.entries()) {
        const donorRecord = await buildDonorRecord(env, {
          ...importedPayload,
          source: sanitizeText(importedPayload?.source, 80) || "csv-import",
          sourceBatchId: record.id,
          sourceRecordId:
            sanitizeText(importedPayload?.sourceRecordId, 320) ||
            `${record.fileName || "donor-import.csv"}#${index + 2}`
        });
        await saveJsonRecord(env, getAdminDonorKey(donorRecord.id), donorRecord);
        importedCount += 1;
      }
    }
  }

  await saveJsonRecord(env, getAdminImportKey(record.id), record);
  return json({ ok: true, importedCount, record }, 201, origin || "*");
};

const handleAdminContentGetPage = async (request, env, origin, pageParam) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const page = normalizeContentPage(pageParam);
  if (!isSupportedContentPage(page)) {
    return json({ error: "Content page not found." }, 404, origin || "*");
  }

  const url = new URL(request.url);
  const resolvedPhase = resolveContentPhase(url.searchParams.get("phase"), page);
  if (resolvedPhase.error) {
    return json({ error: resolvedPhase.error }, 400, origin || "*");
  }
  const phase = resolvedPhase.phase;

  const view = sanitizeText(url.searchParams.get("view"), 40).toLowerCase();
  if (view && !["draft", "published"].includes(view)) {
    return json({ error: "Invalid content view." }, 400, origin || "*");
  }

  const stored = await loadJsonRecord(env, getAdminContentKey(phase, page));
  const pageRecord = buildContentPageResponse(stored, page, phase, { publicView: false });
  return json({ ok: true, page: pageRecord }, 200, origin || "*");
};

const handleAdminContentSaveDraft = async (request, env, origin, pageParam) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const page = normalizeContentPage(pageParam);
  if (!isSupportedContentPage(page)) {
    return json({ error: "Content page not found." }, 404, origin || "*");
  }

  let payload;
  try {
    payload = await request.json();
  } catch (error) {
    return json({ error: "Invalid JSON" }, 400, origin || "*");
  }

  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return json({ error: "Invalid content payload." }, 400, origin || "*");
  }

  const url = new URL(request.url);
  const resolvedPhase = resolveContentPhase(url.searchParams.get("phase") || payload.phase, page);
  if (resolvedPhase.error) {
    return json({ error: resolvedPhase.error }, 400, origin || "*");
  }
  const phase = resolvedPhase.phase;

  if (payload.page && normalizeContentPage(payload.page) !== page) {
    return json({ error: "Payload page does not match route page." }, 400, origin || "*");
  }

  const sanitizedDraft = sanitizeContentDraftPayload(payload.draft, page);
  if (sanitizedDraft.error) {
    return json({ error: sanitizedDraft.error }, 400, origin || "*");
  }

  const key = getAdminContentKey(phase, page);
  const existing = await loadJsonRecord(env, key);
  const now = new Date().toISOString();
  const nextRecord = {
    id: sanitizeText(existing?.id, 120) || createRecordId(),
    type: "content-page",
    page,
    phase,
    createdAt: sanitizeText(existing?.createdAt, 64) || now,
    updatedAt: now,
    updatedBy: verified.user.email,
    draft: {
      content: sanitizedDraft.content,
      updatedAt: now,
      updatedBy: verified.user.email
    },
    published: {
      content: ensurePageScopedContent(existing?.published?.content, page),
      updatedAt: sanitizeText(existing?.published?.updatedAt, 64),
      updatedBy: sanitizeText(existing?.published?.updatedBy, 254)
    },
    publishedAt: sanitizeText(existing?.publishedAt, 64)
  };

  await saveJsonRecord(env, key, nextRecord);
  const pageRecord = buildContentPageResponse(nextRecord, page, phase, { publicView: false });
  const statusCode = existing ? 200 : 201;
  return json({ ok: true, page: pageRecord }, statusCode, origin || "*");
};

const handleAdminContentPublishPage = async (request, env, origin, pageParam) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const page = normalizeContentPage(pageParam);
  if (!isSupportedContentPage(page)) {
    return json({ error: "Content page not found." }, 404, origin || "*");
  }

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  if (payload && (typeof payload !== "object" || Array.isArray(payload))) {
    return json({ error: "Invalid content payload." }, 400, origin || "*");
  }

  const url = new URL(request.url);
  const resolvedPhase = resolveContentPhase(url.searchParams.get("phase") || payload?.phase, page);
  if (resolvedPhase.error) {
    return json({ error: resolvedPhase.error }, 400, origin || "*");
  }
  const phase = resolvedPhase.phase;

  if (payload?.page && normalizeContentPage(payload.page) !== page) {
    return json({ error: "Payload page does not match route page." }, 400, origin || "*");
  }

  const key = getAdminContentKey(phase, page);
  const existing = await loadJsonRecord(env, key);
  const now = new Date().toISOString();
  let draftContent = ensurePageScopedContent(existing?.draft?.content, page);
  const hasExistingDraft = Boolean(Object.keys(draftContent?.[page] || {}).length);

  if (payload?.draft !== undefined) {
    const sanitizedDraft = sanitizeContentDraftPayload(payload.draft, page);
    if (sanitizedDraft.error) {
      return json({ error: sanitizedDraft.error }, 400, origin || "*");
    }
    draftContent = sanitizedDraft.content;
  } else if (!hasExistingDraft) {
    return json({ error: "No draft content exists for this page yet." }, 400, origin || "*");
  }

  const nextRecord = {
    id: sanitizeText(existing?.id, 120) || createRecordId(),
    type: "content-page",
    page,
    phase,
    createdAt: sanitizeText(existing?.createdAt, 64) || now,
    updatedAt: now,
    updatedBy: verified.user.email,
    draft: {
      content: draftContent,
      updatedAt: now,
      updatedBy: verified.user.email
    },
    published: {
      content: draftContent,
      updatedAt: now,
      updatedBy: verified.user.email
    },
    publishedAt: now
  };

  await saveJsonRecord(env, key, nextRecord);
  const pageRecord = buildContentPageResponse(nextRecord, page, phase, { publicView: false });
  return json({ ok: true, page: pageRecord }, 200, origin || "*");
};

const handlePublicContentGetPage = async (request, env, origin, pageParam) => {
  const page = normalizeContentPage(pageParam);
  if (!isSupportedContentPage(page)) {
    return json({ error: "Content page not found." }, 404, origin || "*");
  }

  const url = new URL(request.url);
  const resolvedPhase = resolveContentPhase(url.searchParams.get("phase"), page);
  if (resolvedPhase.error) {
    return json({ error: resolvedPhase.error }, 400, origin || "*");
  }
  const phase = resolvedPhase.phase;

  const view = sanitizeText(url.searchParams.get("view"), 40).toLowerCase();
  if (view && view !== "published") {
    return json({ error: "Public content endpoint only supports view=published." }, 400, origin || "*");
  }

  const stored = await loadJsonRecord(env, getAdminContentKey(phase, page));
  const pageRecord = buildContentPageResponse(stored, page, phase, { publicView: true });
  return json({ ok: true, page: pageRecord }, 200, origin || "*");
};

const handleAdminInboxProcess = async (request, env, origin, sourceRecordId) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const sourceRecord = await loadJsonRecord(env, sourceRecordId);
  if (!sourceRecord) {
    return json({ error: "Source inbox record not found." }, 404, origin || "*");
  }

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  const existing = await loadJsonRecord(env, getAdminInboxKey(sourceRecordId));
  const now = new Date().toISOString();
  const record = {
    id: existing?.id || createRecordId(),
    type: "inbox-status",
    createdAt: existing?.createdAt || now,
    updatedAt: now,
    sourceRecordId,
    sourceKind: sourceRecordId.startsWith("form:") ? "form" : (sourceRecordId.startsWith("email:") ? "email" : "record"),
    formType: sanitizeText(sourceRecord?.formType, 60),
    status: sanitizeText(payload.status, 40) || "processed",
    note: sanitizeText(payload.note, 1000),
    processedAt: now
  };

  await saveJsonRecord(env, getAdminInboxKey(sourceRecordId), record);
  return json({ ok: true, record }, 200, origin || "*");
};

const handleAdminInboxConvert = async (request, env, origin, sourceRecordId) => {
  const verified = await getVerifiedAdminSession(request, env);
  if (!verified) {
    return json({ error: "Unauthorized" }, 401, origin || "*");
  }

  const sourceRecord = await loadJsonRecord(env, sourceRecordId);
  if (!sourceRecord) {
    return json({ error: "Source inbox record not found." }, 404, origin || "*");
  }

  let payload = {};
  try {
    payload = await request.json().catch(() => ({}));
  } catch (error) {
    payload = {};
  }

  const requestedTarget = sanitizeText(payload.target, 20).toLowerCase();
  const target =
    requestedTarget ||
    (sourceRecord.formType === "membership" ? "member" : (sourceRecord.formType === "general-donation" ? "donor" : ""));

  if (!["member", "donor"].includes(target)) {
    return json({ error: "Conversion target must be member or donor." }, 400, origin || "*");
  }

  const conversionPayload = buildConversionPayloadFromSourceRecord(sourceRecord, target, sourceRecordId);
  const now = new Date().toISOString();
  let convertedRecord;

  if (target === "member") {
    convertedRecord = await buildMemberRecord(env, conversionPayload);
    await saveJsonRecord(env, getAdminMemberKey(convertedRecord.id), convertedRecord);
  } else {
    convertedRecord = await buildDonorRecord(env, conversionPayload);
    await saveJsonRecord(env, getAdminDonorKey(convertedRecord.id), convertedRecord);
  }

  const inboxStatus = {
    id: createRecordId(),
    type: "inbox-status",
    createdAt: now,
    updatedAt: now,
    sourceRecordId,
    sourceKind: sourceRecordId.startsWith("form:") ? "form" : (sourceRecordId.startsWith("email:") ? "email" : "record"),
    formType: sanitizeText(sourceRecord?.formType, 60),
    status: `converted-${target}`,
    note: sanitizeText(payload.note, 1000),
    processedAt: now,
    convertedRecordId: convertedRecord.id,
    convertedRecordType: target
  };

  await saveJsonRecord(env, getAdminInboxKey(sourceRecordId), inboxStatus);
  return json({ ok: true, target, record: convertedRecord, inboxStatus }, 201, origin || "*");
};

export default {
  async fetch(request, env) {
    const origin = getAllowedOrigin(request, env);
    const url = new URL(request.url);
    const isAdminMailCallbackRoute =
      request.method === "GET" &&
      (url.pathname === "/admin/mail/callback" || url.pathname === "/admin/mail/callback/");
    const memberRouteMatch = getMemberRouteMatch(url.pathname);
    const donorRouteMatch = getDonorRouteMatch(url.pathname);
    const inboxActionRouteMatch = getInboxActionRouteMatch(url.pathname);
    const adminContentPageRouteMatch = getAdminContentPageRouteMatch(url.pathname);
    const adminContentPublishRouteMatch = getAdminContentPublishRouteMatch(url.pathname);
    const publicContentPageRouteMatch = getPublicContentPageRouteMatch(url.pathname);
    const adminMailMessageRouteMatch = getAdminMailMessageRouteMatch(url.pathname);
    const adminMailMessageStateRouteMatch = getAdminMailMessageStateRouteMatch(url.pathname);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          ...getCorsHeaders(origin || "*"),
          "Access-Control-Max-Age": "86400"
        }
      });
    }

    if (!origin && !isAdminMailCallbackRoute) {
      return json({ error: "Origin not allowed" }, 403, "null");
    }

    if (!env.SUBSCRIBERS) {
      return json({ error: "Missing KV binding" }, 500, origin || "*");
    }

    if (request.method === "GET" && (url.pathname === "/admin/status" || url.pathname === "/admin/status/")) {
      return handleAdminStatus(env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/mail/status" || url.pathname === "/admin/mail/status/")) {
      return handleAdminMailStatus(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/mail/connect" || url.pathname === "/admin/mail/connect/")) {
      return handleAdminMailConnect(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/mail/callback" || url.pathname === "/admin/mail/callback/")) {
      return handleAdminMailCallback(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/mail/folders" || url.pathname === "/admin/mail/folders/")) {
      return handleAdminMailFolders(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/mail/messages" || url.pathname === "/admin/mail/messages/")) {
      return handleAdminMailMessages(request, env, origin);
    }

    if (request.method === "GET" && adminMailMessageRouteMatch) {
      return handleAdminMailMessageGet(request, env, origin, getDecodedPathParam(adminMailMessageRouteMatch[1]));
    }

    if (request.method === "PUT" && adminMailMessageStateRouteMatch) {
      return handleAdminMailMessageReadState(
        request,
        env,
        origin,
        getDecodedPathParam(adminMailMessageStateRouteMatch[1]),
        getDecodedPathParam(adminMailMessageStateRouteMatch[2]).toLowerCase()
      );
    }

    if (request.method === "POST" && (url.pathname === "/admin/mail/send" || url.pathname === "/admin/mail/send/")) {
      return handleAdminMailSend(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/mail/reply" || url.pathname === "/admin/mail/reply/")) {
      return handleAdminMailReply(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/mail/send-test" || url.pathname === "/admin/mail/send-test/")) {
      return handleAdminMailSendTest(request, env, origin);
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/admin/mail/send-newsletter" || url.pathname === "/admin/mail/send-newsletter/")
    ) {
      return handleAdminMailSendNewsletter(request, env, origin);
    }

    if (
      request.method === "POST" &&
      (
        url.pathname === "/admin/signup" ||
        url.pathname === "/admin/signup/" ||
        url.pathname === "/admin/setup" ||
        url.pathname === "/admin/setup/"
      )
    ) {
      return handleAdminSignup(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/login" || url.pathname === "/admin/login/")) {
      return handleAdminLogin(request, env, origin);
    }

    if (
      request.method === "POST" &&
      (url.pathname === "/admin/request-password-reset" || url.pathname === "/admin/request-password-reset/")
    ) {
      return handleAdminRequestPasswordReset(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/reset-password" || url.pathname === "/admin/reset-password/")) {
      return handleAdminResetPassword(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/change-password" || url.pathname === "/admin/change-password/")) {
      return handleAdminChangePassword(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/support/contact" || url.pathname === "/admin/support/contact/")) {
      return handleAdminSupportContact(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/dashboard" || url.pathname === "/admin/dashboard/")) {
      return handleAdminDashboard(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/people" || url.pathname === "/admin/people/")) {
      return handleAdminPeopleList(request, env, origin);
    }

    if (request.method === "GET" && (url.pathname === "/admin/members" || url.pathname === "/admin/members/")) {
      return handleAdminMembersList(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/members" || url.pathname === "/admin/members/")) {
      return handleAdminCreateMember(request, env, origin);
    }

    if (request.method === "PATCH" && memberRouteMatch) {
      return handleAdminUpdateMember(request, env, origin, getDecodedPathParam(memberRouteMatch[1]));
    }

    if (request.method === "GET" && (url.pathname === "/admin/donors" || url.pathname === "/admin/donors/")) {
      return handleAdminDonorsList(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/donors" || url.pathname === "/admin/donors/")) {
      return handleAdminCreateDonor(request, env, origin);
    }

    if (request.method === "PATCH" && donorRouteMatch) {
      return handleAdminUpdateDonor(request, env, origin, getDecodedPathParam(donorRouteMatch[1]));
    }

    if (request.method === "GET" && (url.pathname === "/admin/imports" || url.pathname === "/admin/imports/")) {
      return handleAdminImportsList(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/admin/imports" || url.pathname === "/admin/imports/")) {
      return handleAdminCreateImportBatch(request, env, origin);
    }

    if (request.method === "GET" && adminContentPageRouteMatch) {
      return handleAdminContentGetPage(request, env, origin, getDecodedPathParam(adminContentPageRouteMatch[1]));
    }

    if (request.method === "PUT" && adminContentPageRouteMatch) {
      return handleAdminContentSaveDraft(request, env, origin, getDecodedPathParam(adminContentPageRouteMatch[1]));
    }

    if (request.method === "POST" && adminContentPublishRouteMatch) {
      return handleAdminContentPublishPage(request, env, origin, getDecodedPathParam(adminContentPublishRouteMatch[1]));
    }

    if (request.method === "POST" && inboxActionRouteMatch) {
      const sourceRecordId = getDecodedPathParam(inboxActionRouteMatch[1]);
      const action = getDecodedPathParam(inboxActionRouteMatch[2]).toLowerCase();

      if (action === "process") {
        return handleAdminInboxProcess(request, env, origin, sourceRecordId);
      }

      if (action === "convert") {
        return handleAdminInboxConvert(request, env, origin, sourceRecordId);
      }
    }

    if (request.method === "GET" && publicContentPageRouteMatch) {
      return handlePublicContentGetPage(request, env, origin, getDecodedPathParam(publicContentPageRouteMatch[1]));
    }

    if (request.method === "POST" && (url.pathname === "/forms" || url.pathname === "/forms/")) {
      return handleOnlineForm(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/contact" || url.pathname === "/contact/")) {
      return handleContactForm(request, env, origin);
    }

    if (request.method === "POST" && (url.pathname === "/" || url.pathname === "")) {
      return handleSubscribe(request, env, origin);
    }

    return json({ error: "Method not allowed" }, 405, origin || "*");
  }
};

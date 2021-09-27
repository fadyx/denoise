import twitter from "twitter-text";

const extractHashtags = (text) => twitter.extractHashtags(text);

export default { extractHashtags };

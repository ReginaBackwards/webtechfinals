import Mux from "@mux/muxplayer";

const Mux = require('@mux/mux-node');

const accessToekn = "a1c9a6da-51d6-415f-9bcd-c52c88c9b66a";
const secret = "xd2lvLMN+Y9onfQq3wR3JGjyjopbj3a+ghEb6PWUgruTvDYA2s6Idtm0jcqTLsWV5mcY1TRPhWy";
const AssetID = "k2WrrrTPLhqtRJ3mimpnNA00HKQTSMPHfKioPRNfyCTk";

const { Video } = new Mux(process.env.accessToekn, process.env.secret);

await Video.Assets.get(AssetID);

// const asset = await Video.Assets.create({
//     input:"https://muxed.s3.amazonaws.com/leds.mp4",
//     playback_policy: "public"
// });


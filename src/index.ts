import { Context, Schema, h } from "koishi";
import { Events } from "./service/events";
import { InnerEvents } from "./service/events_in";
import { Labs } from "./service/labs";
import { InnerEvent, Lab } from "./types";
import {
  generateInfoImage,
  generateRankImage,
  generateProblemImage,
  generateDayRankImage,
  generateContestRankImage,
  generateProblemSearchImage,
} from "./template";
import { } from "koishi-plugin-adapter-onebot";

export const name = "devb-doc-api";

export const inject = ["http", "database", "puppeteer"];

interface Group {
  platform: string;
  uid: string;
}

export interface Config {
  baseURL: string;
  checker: string;
  groups: Array<Group>;
  contestId: string;
}

export const Config: Schema<Config> = Schema.object({
  baseURL: Schema.string().required().description("API请求地址"),
  checker: Schema.string().description("接收审核信息的账号"),
  groups: Schema.array(
    Schema.object({
      platform: Schema.string().required(),
      uid: Schema.string().required(),
    })
  )
    .description("接收审核信息的群组")
    .role("table"),
  contestId: Schema.string().default("2012").description("榜单默认比赛ID"),
});

export function apply(ctx: Context, config: Config) {
  let events = new Events(ctx, config);
  let inner = new InnerEvents(ctx, config);
  let labs = new Labs(ctx, config);

  ctx
    .command("devb-e [plat:text]", "查询校外比赛信息")
    .action(async ({ session }, plat) => {
      let res = await events.getEvents(plat);
      let imgBuffer = await generateInfoImage(ctx, res.sum);
      session.send(h("message", h.image(imgBuffer, "image/png"), res.part));
    });

  ctx.command("devb-ine", "查询校内比赛信息").action(async ({ session }) => {
    let res = await inner.getEvents(true);
    let imgBuffer = await generateInfoImage(ctx, res);
    session.send(
      h(
        "message",
        h.image(imgBuffer, "image/png"),
        "信息详情: https://www.frexlink.cn/main.html"
      )
    );
  });

  ctx
    .command("devb-unine", "查询未审核的校内比赛信息")
    .action(async ({ session }) => {
      let res = await inner.getEvents(false);
      let imgBuffer = await generateInfoImage(ctx, res);
      session.send(h("message", h.image(imgBuffer, "image/png")));
    });

  ctx
    .command("devb-upine", "上传校内比赛信息")
    .option("name", "-n <比赛名称>")
    .option("summary", "-s [比赛简介]", { fallback: "暂无" })
    .option("notes", "-e [比赛说明]", { fallback: "暂无" })
    .option("time", "-t [比赛时间]", { fallback: "暂无" })
    .action(async ({ session, options }) => {
      let data: InnerEvent = {
        uid: null,
        name: options.name,
        summary: options.summary,
        notes: options.notes,
        startAt: options.time,
        release: false,
      };
      let res = await inner.uploadEvent(data);
      session.send(h("message", h.quote(session.messageId), res));
    });

  ctx
    .command(
      "devb-updine <uid:string> <column:string> <content:string>",
      "更新校内比赛信息"
    )
    .action(async ({ session }, uid, column, content) => {
      if (uid === undefined || column === undefined || content === undefined) {
        session.send(
          h("message", h.quote(session.messageId), "参数不足，请补充参数!")
        );
      } else {
        let res = await inner.updateEvent(uid, column, content);
        session.send(h("message", h.quote(session.messageId), res));
      }
    });

  ctx
    .command("devb-deine <uid:string>", "删除校内比赛信息")
    .action(async ({ session }, uid) => {
      let res = await inner.deleteEvent(uid);
      session.send(h("message", h.quote(session.messageId), res));
    });

  ctx.command("devb-lab", "查询校内实验室信息").action(async ({ session }) => {
    let res = await labs.getLabs(true);
    let imgBuffer = await generateInfoImage(ctx, res);
    session.send(
      h(
        "message",
        h.image(imgBuffer, "image/png"),
        "信息详情: https://www.frexlink.cn/main.html"
      )
    );
  });

  ctx
    .command("devb-unlab", "查询未审核实验室信息")
    .action(async ({ session }) => {
      let res = await labs.getLabs(false);
      let imgBuffer = await generateInfoImage(ctx, res);
      session.send(h("message", h.image(imgBuffer, "image/png")));
    });

  ctx
    .command("devb-uplab", "上传校内实验室信息")
    .option("name", "-n <实验室名称>")
    .option("summary", "-s [实验室简介]", { fallback: "暂无" })
    .option("college", "-c [实验室学院]", { fallback: "待上传" })
    .option("position", "-p [实验室位置]", { fallback: "待上传" })
    .option("limit", "-l [招新范围]", { fallback: "暂无" })
    .option("group", "-g [招新交流群]", { fallback: "暂无" })
    .option("time", "-t [招新时间]", { fallback: "暂无" })
    .action(async ({ session, options }) => {
      let data: Lab = {
        uid: null,
        name: options.name,
        summary: options.summary,
        college: options.college,
        position: options.position,
        limit: options.limit,
        group: options.group,
        time: options.time,
        release: false,
      };
      let res = await labs.uploadLab(data);
      session.send(h("message", h.quote(session.messageId), res));
    });

  ctx
    .command(
      "devb-updlab <uid:string> <column:string> <content:string>",
      "更新实验室信息"
    )
    .action(async ({ session }, uid, column, content) => {
      if (uid === undefined || column === undefined || content === undefined) {
        session.send(
          h("message", h.quote(session.messageId), "参数不足，请补充参数!")
        );
      } else {
        let res = await labs.updateLab(uid, column, content);
        session.send(h("message", h.quote(session.messageId), res));
      }
    });

  ctx
    .command("devb-delab <uid:string>", "删除实验室信息")
    .action(async ({ session }, uid) => {
      let res = await labs.deleteLab(uid);
      session.send(h("message", h.quote(session.messageId), res));
    });

  ctx
    .command("ojr [pre:string]", "查询OJ排名")
    .action(async ({ session }, pre) => {
      let imgBuffer = await generateRankImage(ctx, pre);
      session.send(h("message", h.image(imgBuffer, "image/png")));
    });

  ctx
    .command("ojc [pre:string]", "查询OJ竞赛排名")
    .action(async ({ session }, pre) => {
      let imgBuffer = await generateContestRankImage(ctx, config, pre);
      session.send(h("message", h.image(imgBuffer, "image/png")));
    });

  ctx.command("ojd", "OJ每日过题排名").action(async ({ session }, pre) => {
    let imgBuffer = await generateDayRankImage(ctx);
    session.send(h("message", h.image(imgBuffer, "image/png")));
  });

  ctx
    .command("ojp <id:number>", "查询OJ题目")
    .action(async ({ session }, id) => {
      if (id === undefined || id < 1000 || id > 5000) {
        session.send(h("message", h.quote(session.messageId), "题目ID不合法!"));
      } else {
        let imgBuffer = await generateProblemImage(ctx, id);
        session.send(h("message", h.image(imgBuffer, "image/png")));
      }
    });

  ctx
    .command("ojs <title:text>", "搜索OJ题目")
    .action(async ({ session }, title) => {
      if (title === undefined) {
        session.send(
          h("message", h.quote(session.messageId), "题目标题不合法!")
        );
      } else {
        let imgBuffer = await generateProblemSearchImage(ctx, title);
        session.send(h("message", h.image(imgBuffer, "image/png")));
      }
    });

  ctx
    .command("poke <target:user> [count:number]", "戳一戳")
    .action(async ({ session }, target, count) => {
      if (!session.guildId) {
        return session.text("此命令只能在群聊中使用。");
      }
      if (!target) {
        return session.text("请指定目标用户。");
      }
      const targetId = target.slice(session.platform.length + 1);
      if (count === undefined) count = 1;
      for (let i = 0; i < count; i++) {
        session.onebot._request("group_poke", {
          group_id: session.guildId,
          user_id: targetId,
        });
        ctx.sleep(500);
      }
    });
}

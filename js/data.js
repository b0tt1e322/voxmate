// ===== 游戏库 =====
const GAMES = [
  // === 异环 & 三角洲（置顶推荐）===
  { id:1, name:"异环", en:"Neverness to Everness", plat:"全平台", cat:"开放世界RPG", tags:["开放世界","RPG","都市","超自然","幻塔"], rating:89, hot:980, icon:"🌃", color:"#9B59B6", desc:"幻塔工作室全新都市开放世界RPG，超自然题材，联机探索组队。", players:22000 },
  { id:2, name:"三角洲行动", en:"Delta Force", plat:"全平台", cat:"战术射击", tags:["FPS","战术","军事","多人","战场"], rating:85, hot:960, icon:"🎯", color:"#2E86C1", desc:"经典军事战术射击系列回归，全面战场与危险行动两大模式。", players:28000 },

  // === Steam 热门游戏 ===
  { id:3, name:"反恐精英2", en:"CS2", plat:"Steam", cat:"FPS", tags:["FPS","竞技","经典","战术"], rating:88, hot:999, icon:"💥", color:"#E67E22", desc:"经典战术射击，Source 2引擎重制，完美竞技平台语音开黑。", players:23500 },
  { id:4, name:"Dota 2", plat:"Steam", cat:"MOBA", tags:["MOBA","竞技","策略","深度"], rating:90, hot:980, icon:"⚔️", color:"#E74C3C", desc:"全球最火MOBA之一，深度策略团队配合语音沟通。", players:18200 },
  { id:5, name:"PUBG", plat:"Steam", cat:"大逃杀", tags:["大逃杀","FPS","生存","经典"], rating:82, hot:970, icon:"🪂", color:"#F39C12", desc:"大逃杀类型开创者，百人竞技四排语音吃鸡。", players:21000 },
  { id:6, name:"永劫无间", en:"Naraka: Bladepoint", plat:"Steam", cat:"动作大逃杀", tags:["大逃杀","动作","武侠","冷兵器"], rating:85, hot:960, icon:"🗡️", color:"#E74C3C", desc:"东方武侠风大逃杀，冷兵器对战三排语音冲分。", players:12500 },
  { id:7, name:"APEX英雄", en:"Apex Legends", plat:"Steam", cat:"大逃杀", tags:["大逃杀","FPS","英雄技能","快节奏"], rating:86, hot:950, icon:"🦅", color:"#E67E22", desc:"英雄技能与大逃杀结合，猎杀者竞技场语音战术。", players:16800 },
  { id:8, name:"黑神话：悟空", en:"Black Myth: Wukong", plat:"Steam", cat:"动作RPG", tags:["动作","RPG","神话","中国"], rating:96, hot:940, icon:"🐵", color:"#8B4513", desc:"中国神话ARPG，联机MOD二周目语音开荒。", players:15800 },
  { id:9, name:"艾尔登法环", en:"Elden Ring", plat:"Steam", cat:"动作RPG", tags:["动作","RPG","开放世界","魂系"], rating:95, hot:920, icon:"⚪", color:"#C0C0C0", desc:"宫崎英高开放世界史诗，联机MOD共斗语音交流。", players:8900 },
  { id:10, name:"博德之门3", en:"Baldur's Gate 3", plat:"Steam", cat:"CRPG", tags:["RPG","策略","D&D","联机"], rating:96, hot:910, icon:"🎲", color:"#8E44AD", desc:"D&D规则史诗CRPG，四人联机语音共斗。", players:7200 },
  { id:11, name:"彩虹六号：围攻", en:"Rainbow Six Siege", plat:"Steam", cat:"战术射击", tags:["FPS","战术","CQB","竞技"], rating:84, hot:900, icon:"🔒", color:"#2C3E50", desc:"室内CQB战术射击，5v5拆弹语音配合至关重要。", players:9500 },
  { id:12, name:"幻兽帕鲁", en:"Palworld", plat:"Steam", cat:"开放世界生存", tags:["生存","开放世界","收集","建造"], rating:84, hot:890, icon:"👾", color:"#2ECC71", desc:"宠物收集×生存建造开放世界，联机语音一起抓帕鲁。", players:9500 },
  { id:13, name:"给他爱5", en:"GTA V Online", plat:"Steam", cat:"开放世界", tags:["开放世界","动作","多人","线上"], rating:92, hot:880, icon:"💰", color:"#F39C12", desc:"洛圣都线上模式，抢劫任务语音配合搞钱。", players:14000 },
  { id:14, name:"怪物猎人：世界", en:"Monster Hunter: World", plat:"Steam", cat:"共斗ARPG", tags:["动作","共斗","狩猎","联机"], rating:91, hot:870, icon:"🐉", color:"#2C3E50", desc:"狩猎巨兽的动作RPG，四人组队语音狩猎。", players:6300 },
  { id:15, name:"黎明杀机", en:"Dead by Daylight", plat:"Steam", cat:"非对称竞技", tags:["恐怖","非对称","竞技","多人"], rating:80, hot:860, icon:"🔪", color:"#1a1a2e", desc:"4v1非对称恐怖竞技，语音报点溜鬼。", players:8500 },
  { id:16, name:"双人成行", en:"It Takes Two", plat:"Steam", cat:"合作冒险", tags:["合作","冒险","解谜","剧情"], rating:95, hot:850, icon:"❤️", color:"#FF6B6B", desc:"年度最佳合作冒险游戏，必须双人语音配合。", players:3200 },
  { id:17, name:"恐鬼症", en:"Phasmophobia", plat:"Steam", cat:"恐怖合作", tags:["恐怖","合作","捉鬼","语音"], rating:82, hot:840, icon:"👻", color:"#4A0080", desc:"4人合作恐怖捉鬼游戏，语音沟通探索鬼屋。", players:5800 },
  { id:18, name:"森林之子", en:"Sons of the Forest", plat:"Steam", cat:"生存恐怖", tags:["生存","恐怖","建造","联机"], rating:88, hot:830, icon:"🌲", color:"#2D5016", desc:"开放世界生存恐怖，联机语音建造求生。", players:4500 },
  { id:19, name:"泰拉瑞亚", en:"Terraria", plat:"Steam", cat:"沙盒冒险", tags:["沙盒","冒险","建造","探索"], rating:97, hot:820, icon:"⛏️", color:"#8B4513", desc:"2D沙盒冒险神作，多人联机语音开荒。", players:6500 },
  { id:20, name:"严阵以待", en:"Ready or Not", plat:"Steam", cat:"战术FPS", tags:["FPS","战术","特警","CQB"], rating:86, hot:810, icon:"🛡️", color:"#1a1a2e", desc:"硬核特警战术FPS，五人小队语音配合攻坚。", players:4200 },
  { id:21, name:"方舟：生存进化", en:"ARK: Survival Evolved", plat:"Steam", cat:"生存沙盒", tags:["生存","恐龙","建造","沙盒"], rating:81, hot:800, icon:"🦖", color:"#27AE60", desc:"恐龙世界生存沙盒，部落联机语音称霸。", players:7800 },
  { id:22, name:"消逝的光芒2", en:"Dying Light 2", plat:"Steam", cat:"动作生存", tags:["动作","生存","跑酷","僵尸"], rating:83, hot:790, icon:"🧟", color:"#E67E22", desc:"丧尸世界跑酷生存，联机语音合作求生。", players:3800 },
  { id:23, name:"收获日3", en:"Payday 3", plat:"Steam", cat:"合作射击", tags:["合作","FPS","抢劫","多人"], rating:75, hot:780, icon:"💼", color:"#2C3E50", desc:"合作抢劫FPS，四人小队语音策划劫案。", players:3200 },
  { id:24, name:"深岩银河", en:"Deep Rock Galactic", plat:"Steam", cat:"合作FPS", tags:["合作","FPS","科幻","采矿"], rating:92, hot:770, icon:"⛏️", color:"#E67E22", desc:"矮人采矿合作FPS，四人语音挖矿打虫子。", players:4800 },

  // === WeGame 热门游戏 ===
  { id:101, name:"英雄联盟", en:"League of Legends", plat:"WeGame", cat:"MOBA", tags:["MOBA","竞技","团队","5v5"], rating:90, hot:999, icon:"🏆", color:"#0397D6", desc:"全球最火MOBA，5v5团队竞技，排位语音双排上分。", players:35000 },
  { id:102, name:"无畏契约", en:"VALORANT", plat:"WeGame", cat:"战术射击", tags:["FPS","战术","英雄技能","拳头"], rating:87, hot:990, icon:"🔫", color:"#FF4655", desc:"拳头出品战术射击，枪法×技能配合语音交流。", players:18500 },
  { id:103, name:"地下城与勇士", en:"DNF", plat:"WeGame", cat:"格斗MMO", tags:["格斗","MMO","横版","经典"], rating:82, hot:980, icon:"💥", color:"#E74C3C", desc:"经典横版格斗MMO，军团本语音开荒效率翻倍。", players:22000 },
  { id:104, name:"穿越火线", en:"CrossFire", plat:"WeGame", cat:"FPS", tags:["FPS","竞技","经典","快节奏"], rating:75, hot:970, icon:"🎯", color:"#F39C12", desc:"国民级FPS，快节奏枪战，战队语音开黑。", players:19000 },
  { id:105, name:"原神", en:"Genshin Impact", plat:"WeGame", cat:"开放世界RPG", tags:["开放世界","RPG","二次元","冒险"], rating:88, hot:960, icon:"🌟", color:"#00BFFF", desc:"米哈游开放世界冒险，周本联机语音刷材料。", players:15000 },
  { id:106, name:"金铲铲之战", plat:"WeGame", cat:"自走棋", tags:["自走棋","策略","休闲","云顶"], rating:83, hot:950, icon:"👑", color:"#F1C40F", desc:"云顶之弈正版自走棋，双人模式语音配合。", players:14500 },
  { id:107, name:"命运方舟", en:"Lost Ark", plat:"WeGame", cat:"MMORPG", tags:["MMO","RPG","动作","军团长"], rating:84, hot:940, icon:"⚓", color:"#8E44AD", desc:"俯视角动作MMORPG，军团长固定队语音指挥。", players:8500 },
  { id:108, name:"天涯明月刀", plat:"WeGame", cat:"MMORPG", tags:["MMO","武侠","RPG","国风"], rating:80, hot:930, icon:"🌙", color:"#3498DB", desc:"国风武侠MMORPG，结义金兰语音开黑。", players:5500 },
  { id:109, name:"逆水寒", plat:"WeGame", cat:"MMORPG", tags:["MMO","武侠","国风","开放世界"], rating:83, hot:920, icon:"🌊", color:"#00BFFF", desc:"国风武侠开放世界MMO，语音组队副本。", players:10000 },
  { id:110, name:"剑网3", en:"JX3", plat:"WeGame", cat:"MMORPG", tags:["MMO","武侠","国风","PVP"], rating:82, hot:910, icon:"🗡️", color:"#E74C3C", desc:"经典武侠MMORPG，25人副本语音指挥。", players:8000 },
  { id:111, name:"梦幻西游", plat:"WeGame", cat:"回合制MMO", tags:["回合制","MMO","经典","养成"], rating:80, hot:900, icon:"🐉", color:"#F1C40F", desc:"经典回合制MMO，五人组队语音抓鬼副本。", players:12000 },
  { id:112, name:"守望先锋2", en:"Overwatch 2", plat:"WeGame", cat:"团队射击", tags:["FPS","团队","英雄","竞技"], rating:78, hot:890, icon:"⚡", color:"#F39C12", desc:"暴雪团队射击游戏，语音配合推车占点。", players:9000 },
  { id:113, name:"炉石传说", en:"Hearthstone", plat:"WeGame", cat:"卡牌策略", tags:["卡牌","策略","竞技","休闲"], rating:85, hot:880, icon:"🃏", color:"#8B4513", desc:"暴雪卡牌策略游戏，战棋酒馆语音吹水。", players:6500 },
  { id:114, name:"魔兽世界", en:"World of Warcraft", plat:"WeGame", cat:"MMORPG", tags:["MMO","RPG","经典","团队"], rating:90, hot:870, icon:"🐉", color:"#8B4513", desc:"经典MMORPG始祖，团队副本语音开荒。", players:11000 },
  { id:115, name:"崩坏：星穹铁道", plat:"WeGame", cat:"回合制RPG", tags:["RPG","回合制","二次元","科幻"], rating:88, hot:860, icon:"🚂", color:"#9B59B6", desc:"米哈游星际冒险RPG，联机刷本语音交流。", players:9000 },
  { id:116, name:"火影忍者", plat:"WeGame", cat:"格斗", tags:["格斗","动漫","竞技","忍者"], rating:80, hot:850, icon:"🍥", color:"#F39C12", desc:"火影忍者改编格斗，语音约战切磋。", players:6000 },
  { id:117, name:"NBA 2K", plat:"WeGame", cat:"体育", tags:["体育","篮球","竞技","多人"], rating:78, hot:840, icon:"🏀", color:"#E67E22", desc:"篮球体育游戏，街头模式语音组队。", players:4500 },
  { id:118, name:"坦克世界", en:"World of Tanks", plat:"WeGame", cat:"载具射击", tags:["载具","射击","军事","竞技"], rating:80, hot:830, icon:"🛡️", color:"#2E86C1", desc:"坦克载具射击游戏，15v15语音指挥作战。", players:5500 }
];

const CATEGORIES = ["全部","MOBA","FPS","大逃杀","MMORPG","开放世界RPG","战术射击","自走棋","动作RPG","格斗","生存","合作","恐怖"];

// ===== 真人搭子数据 =====
const REAL_PLAYERS = [
  { id:101, name:"林夜", avatar:"😎", level:"钻石Ⅲ", game:"英雄联盟", mode:"排位赛", desc:"主玩AD，电一钻石，找稳定辅助双排上分", tags:["AD","电一","双排"], online:true, vc:true },
  { id:102, name:"苏晚晴", avatar:"🌸", level:"铂金Ⅰ", game:"无畏契约", mode:"竞技模式", desc:"女生玩家，瓦罗兰特色，找不压力队友开语音", tags:["女生","不压力","开语音"], online:true, vc:true },
  { id:103, name:"陈默", avatar:"🐺", level:"大师", game:"CS2", mode:"完美竞技", desc:"完美A分段指挥型玩家，找能语音交流的队友", tags:["指挥","完美A","语音"], online:true, vc:true },
  { id:104, name:"周逸", avatar:"🔥", level:"超凡大师", game:"永劫无间", mode:"三排冲分", desc:"固定队缺一人，要求会振刀会配合开麦", tags:["固定队","振刀","开麦"], online:true, vc:true },
  { id:105, name:"赵云溪", avatar:"🦊", level:"黄金Ⅰ", game:"异环", mode:"探索组队", desc:"刚入坑异环，找搭子语音一起探索都市联机做任务", tags:["异环","探索","语音组队"], online:true, vc:true },
  { id:106, name:"江北", avatar:"🐯", level:"铂金Ⅱ", game:"三角洲行动", mode:"全面战场", desc:"三角洲老兵，找固定队打全面战场，必须开语音配合", tags:["三角洲","老兵","语音配合"], online:true, vc:true },
  { id:107, name:"季雨桐", avatar:"🐰", level:"钻石Ⅱ", game:"APEX英雄", mode:"排位", desc:"猎杀者以下都可，主玩恶灵探路者，开麦交流", tags:["APEX","排位","开麦"], online:false, vc:true },
  { id:108, name:"沈星野", avatar:"🌙", level:"翡翠Ⅲ", game:"黑神话：悟空", mode:"联机MOD", desc:"二周目联机MOD开荒，找队友语音一起打", tags:["黑神话","二周目","语音联机"], online:true, vc:true },
  { id:109, name:"顾念", avatar:"💜", level:"钻石Ⅳ", game:"命运方舟", mode:"军团长", desc:"军团长固定队缺奶妈，语音指挥打本", tags:["命运方舟","军团长","语音"], online:false, vc:true },
  { id:110, name:"陆子轩", avatar:"⚡", level:"超凡大师", game:"Dota 2", mode:"天梯冲分", desc:"万古流芳中单，找高质量队友语音冲冠绝", tags:["Dota2","中单","语音冲分"], online:true, vc:true },
  { id:111, name:"安知鱼", avatar:"🐱", level:"铂金Ⅲ", game:"原神", mode:"周本联机", desc:"56级萌新，找大佬语音带周本深渊", tags:["原神","萌新","语音求带"], online:true, vc:true },
  { id:112, name:"叶寒", avatar:"❄️", level:"钻石Ⅰ", game:"PUBG", mode:"四排", desc:"老玩家KD3.5，找固定四排语音队友", tags:["PUBG","四排","KD3.5"], online:false, vc:true },
  { id:113, name:"夏晚", avatar:"🌊", level:"黄金Ⅱ", game:"金铲铲之战", mode:"双人模式", desc:"钻石守门员，找搭子语音玩双人模式", tags:["金铲铲","双人","语音娱乐"], online:true, vc:true },
  { id:114, name:"裴修远", avatar:"🗡️", level:"大师", game:"永劫无间", mode:"单排陪练", desc:"大师段位可陪练教身法刀法，开麦教学", tags:["永劫无间","陪练","语音教学"], online:true, vc:true },
  { id:115, name:"洛星", avatar:"⭐", level:"铂金Ⅱ", game:"三角洲行动", mode:"危险行动", desc:"三角洲危险行动摸金撤离，找语音队友配合", tags:["三角洲","摸金","语音"], online:true, vc:true },
  { id:116, name:"萧景", avatar:"🎪", level:"翡翠Ⅱ", game:"异环", mode:"副本联机", desc:"异环异象副本开荒，找手法好能语音的队友", tags:["异环","副本","语音开荒"], online:false, vc:true },
  { id:117, name:"顾北辰", avatar:"🐉", level:"王者", game:"英雄联盟", mode:"灵活组排", desc:"郊区王者，带妹上分，要求开麦不压力", tags:["LOL","王者","带妹"], online:true, vc:true },
  { id:118, name:"江一宸", avatar:"🗡️", level:"钻石", game:"地下城与勇士", mode:"军团本", desc:"DNF巴卡尔困难找奶，语音指挥效率打", tags:["DNF","巴卡尔","语音"], online:true, vc:true },
  { id:119, name:"白雨棠", avatar:"🌸", level:"铂金Ⅰ", game:"逆水寒", mode:"副本", desc:"逆水寒舞阳城固定队缺输出，语音教学", tags:["逆水寒","副本","语音教学"], online:true, vc:true },
  { id:120, name:"凌霄", avatar:"⚡", level:"钻石Ⅴ", game:"守望先锋2", mode:"竞技", desc:"OW2白金输出，找T奶语音组排上分", tags:["OW2","组排","语音"], online:true, vc:true }
];

// ===== 语音大厅预设频道 =====
const VOICE_ROOMS = [
  { id:"vr1", name:"异环 · 都市探索", icon:"🌃", game:"异环", desc:"异环玩家聚集地，探索都市联机做任务", max:8 },
  { id:"vr2", name:"三角洲 · 全面战场", icon:"🎯", game:"三角洲行动", desc:"三角洲老兵集合，全面战场战术配合", max:8 },
  { id:"vr3", name:"LOL · 峡谷开黑", icon:"🏆", game:"英雄联盟", desc:"峡谷召唤师集合，排位匹配开黑语音", max:6 },
  { id:"vr4", name:"瓦罗兰 · 战术小队", icon:"🔫", game:"无畏契约", desc:"瓦罗兰特色玩家，竞技模式语音配合", max:5 },
  { id:"vr5", name:"CS2 · 完美竞技", icon:"💥", game:"CS2", desc:"完美平台竞技，战术指挥语音配合", max:5 },
  { id:"vr6", name:"PUBG · 绝地求生", icon:"🪂", game:"PUBG", desc:"百人竞技求生，四排语音吃鸡", max:4 },
  { id:"vr7", name:"永劫无间 · 聚窟洲", icon:"🗡️", game:"永劫无间", desc:"永劫无间三排冲分，振刀语音配合", max:3 },
  { id:"vr8", name:"APEX · 猎杀者", icon:"🦅", game:"APEX英雄", desc:"APEX猎杀者竞技场，语音战术配合", max:3 },
  { id:"vr9", name:"DNF · 阿拉德", icon:"💥", game:"地下城与勇士", desc:"阿拉德勇士集合，军团本语音开荒", max:4 },
  { id:"vr10", name:"原神 · 提瓦特", icon:"🌟", game:"原神", desc:"提瓦特大陆冒险，周本联机语音", max:4 },
  { id:"vr11", name:"Dota2 · 天梯冲分", icon:"⚔️", game:"Dota 2", desc:"冠绝超凡局，中单大哥语音配合", max:5 },
  { id:"vr12", name:"彩虹六号 · 拆弹", icon:"🔒", game:"彩虹六号：围攻", desc:"室内CQB战术射击，5v5语音拆弹", max:5 },
  { id:"vr13", name:"魔兽世界 · 团本", icon:"🐉", game:"魔兽世界", desc:"艾泽拉斯勇士集合，团队副本语音指挥", max:10 },
  { id:"vr14", name:"GTA V · 洛圣都", icon:"💰", game:"给他爱5", desc:"洛圣都线上抢劫，语音配合搞钱", max:6 },
  { id:"vr15", name:"自由开黑 · 综合", icon:"🎮", game:"综合", desc:"任何游戏都可，自由组队开黑语音", max:10 },
  { id:"vr16", name:"闲聊 · 摸鱼交友", icon:"☕", game:"综合", desc:"不打游戏时聊天吹水交朋友", max:10 }
];


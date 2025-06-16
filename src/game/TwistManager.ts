import { Player, NPC, GameState } from '../types/GameTypes';

export interface GameTwist {
  id: string;
  name: string;
  description: string;
  environment: {
    skyColor: number;
    fogColor: number;
    ambientLightIntensity: number;
    directionalLightColor: number;
  };
  playerOutfit: string;
  npcAssignments: {
    jobGiver: {
      id: string;
      name: string;
      description: string;
    };
    informant: {
      id: string;
      name: string;
      description: string;
    };
    target: {
      id: string;
      name: string;
      description: string;
    };
  };
  npcDialogueVariations: {
    [npcId: string]: {
      personality: string;
      dialogueStyle: string;
      suspicionLevel: number;
    };
  };
  specialEffects?: string[];
  bustMessage: string;
  bustSubMessage: string;
  jailMessage: string;
  warningMessage: string;
  conversationSet: 'A' | 'B'; // Alternating conversation sets
}

export class TwistManager {
  private twists: GameTwist[] = [
    // Loop 1 - Sunny Day (Set A)
    {
      id: 'sunny_day',
      name: 'Sunny Day Setup',
      description: 'A bright, cheerful day in the city. Everything seems normal...',
      environment: {
        skyColor: 0x87CEEB,
        fogColor: 0x87CEEB,
        ambientLightIntensity: 0.8,
        directionalLightColor: 0xffffff
      },
      playerOutfit: 'street',
      npcAssignments: {
        jobGiver: {
          id: 'undercover1',
          name: 'Marcus "The Broker"',
          description: 'Friendly businessman with a suspicious smile'
        },
        informant: {
          id: 'informant1',
          name: 'Jenny "The Whisper"',
          description: 'Street-smart woman who knows everyone'
        },
        target: {
          id: 'target1',
          name: 'Tommy "Red Jacket"',
          description: 'Casual guy in a distinctive red jacket'
        }
      },
      npcDialogueVariations: {
        'undercover1': {
          personality: 'friendly',
          dialogueStyle: 'casual',
          suspicionLevel: 0.2
        },
        'informant1': {
          personality: 'helpful',
          dialogueStyle: 'street_smart',
          suspicionLevel: 0.3
        },
        'target1': {
          personality: 'relaxed',
          dialogueStyle: 'casual',
          suspicionLevel: 0.1
        }
      },
      bustMessage: "GOTCHA! 🤣",
      bustSubMessage: "You should have not taken the murder task, it was all a trap!",
      jailMessage: "Maybe next time don't trust strangers with 'easy money' 😏",
      warningMessage: "The cops were watching all along! This was a sting operation from the start!",
      conversationSet: 'A'
    },
    // Loop 2 - Rainy Night (Set B)
    {
      id: 'rainy_night',
      name: 'Rainy Night Conspiracy',
      description: 'Dark, rainy evening. The streets are slick and dangerous...',
      environment: {
        skyColor: 0x2C3E50,
        fogColor: 0x34495E,
        ambientLightIntensity: 0.3,
        directionalLightColor: 0x6699CC
      },
      playerOutfit: 'trench',
      npcAssignments: {
        jobGiver: {
          id: 'undercover2',
          name: 'Vincent "The Shadow"',
          description: 'Mysterious figure in a dark coat'
        },
        informant: {
          id: 'informant2',
          name: 'Rosa "Night Eyes"',
          description: 'Paranoid woman who sees everything in the darkness'
        },
        target: {
          id: 'target2',
          name: 'Eddie "Raincoat"',
          description: 'Nervous man always looking over his shoulder'
        }
      },
      npcDialogueVariations: {
        'undercover2': {
          personality: 'mysterious',
          dialogueStyle: 'noir',
          suspicionLevel: 0.4
        },
        'informant2': {
          personality: 'paranoid',
          dialogueStyle: 'whispered',
          suspicionLevel: 0.7
        },
        'target2': {
          personality: 'nervous',
          dialogueStyle: 'suspicious',
          suspicionLevel: 0.6
        }
      },
      specialEffects: ['rain'],
      bustMessage: "THE SHADOWS HAD EYES! ⚡",
      bustSubMessage: "You walked right into our surveillance net in the rain!",
      jailMessage: "The rain washes away evidence, but not your mistakes... 🌧️",
      warningMessage: "Every shadow was an undercover agent! The whole street was watching!",
      conversationSet: 'B'
    },
    // Loop 3 - Cyberpunk (Set A - Same conversations as Loop 1)
    {
      id: 'neon_cyberpunk',
      name: 'Neon Cyberpunk Future',
      description: 'High-tech city with neon lights and digital surveillance everywhere...',
      environment: {
        skyColor: 0x1a0033,
        fogColor: 0x330066,
        ambientLightIntensity: 0.5,
        directionalLightColor: 0xFF00FF
      },
      playerOutfit: 'casual',
      npcAssignments: {
        jobGiver: {
          id: 'undercover3',
          name: 'Agent X-7 "The Connector"',
          description: 'Corporate executive with cybernetic enhancements'
        },
        informant: {
          id: 'informant3',
          name: 'Nyx "Data Stream"',
          description: 'Hacker with glowing neural implants'
        },
        target: {
          id: 'target3',
          name: 'Zero "Ghost Protocol"',
          description: 'Augmented individual trying to stay off the grid'
        }
      },
      npcDialogueVariations: {
        'undercover3': {
          personality: 'tech_savvy',
          dialogueStyle: 'corporate',
          suspicionLevel: 0.8
        },
        'informant3': {
          personality: 'hacker',
          dialogueStyle: 'coded',
          suspicionLevel: 0.9
        },
        'target3': {
          personality: 'augmented',
          dialogueStyle: 'robotic',
          suspicionLevel: 0.5
        }
      },
      specialEffects: ['neon_glow'],
      bustMessage: "SYSTEM ALERT! 🤖",
      bustSubMessage: "Criminal detected via neural scan! Your thoughts betrayed you!",
      jailMessage: "Welcome to Digital Detention. Your crime data has been uploaded to the cloud ☁️",
      warningMessage: "The AI surveillance system tracked your every move and intention!",
      conversationSet: 'A'
    },
    // Loop 4 - Wild West (Set B - Same conversations as Loop 2)
    {
      id: 'desert_western',
      name: 'Wild West Showdown',
      description: 'Dusty desert town with tumbleweeds and saloon doors...',
      environment: {
        skyColor: 0xFFB347,
        fogColor: 0xDEB887,
        ambientLightIntensity: 0.9,
        directionalLightColor: 0xFFD700
      },
      playerOutfit: 'street',
      npcAssignments: {
        jobGiver: {
          id: 'undercover4',
          name: 'Sheriff Jake "The Badge"',
          description: 'Lawman with a hidden agenda'
        },
        informant: {
          id: 'informant4',
          name: 'Saloon Sally "Whiskey Lips"',
          description: 'Bartender who knows all the town secrets'
        },
        target: {
          id: 'target4',
          name: 'Outlaw Pete "Six-Shooter"',
          description: 'Wanted man with a bounty on his head'
        }
      },
      npcDialogueVariations: {
        'undercover4': {
          personality: 'sheriff',
          dialogueStyle: 'western',
          suspicionLevel: 0.6
        },
        'informant4': {
          personality: 'saloon_keeper',
          dialogueStyle: 'old_west',
          suspicionLevel: 0.4
        },
        'target4': {
          personality: 'outlaw',
          dialogueStyle: 'cowboy',
          suspicionLevel: 0.7
        }
      },
      specialEffects: ['dust_storm'],
      bustMessage: "YEEHAW! GOTCHA PARTNER! 🤠",
      bustSubMessage: "This town ain't big enough for criminals like you!",
      jailMessage: "Locked up in the old jailhouse. The desert sun ain't forgiving... ☀️",
      warningMessage: "The whole town was in on it! Even the tumbleweeds were suspicious!",
      conversationSet: 'B'
    },
    // Loop 5 - Zombie Apocalypse (Set A)
    {
      id: 'zombie_apocalypse',
      name: 'Zombie Apocalypse Survival',
      description: 'Post-apocalyptic world overrun by zombies. Trust no one...',
      environment: {
        skyColor: 0x8B0000,
        fogColor: 0x654321,
        ambientLightIntensity: 0.4,
        directionalLightColor: 0xFF4500
      },
      playerOutfit: 'prison',
      npcAssignments: {
        jobGiver: {
          id: 'undercover5',
          name: 'Commander Rex "Survivor"',
          description: 'Military leader of the safe zone'
        },
        informant: {
          id: 'informant5',
          name: 'Doc "Medic"',
          description: 'Field medic who treats both humans and... others'
        },
        target: {
          id: 'target5',
          name: 'Patient Zero "The Infected"',
          description: 'Someone who might be turning...'
        }
      },
      npcDialogueVariations: {
        'undercover5': {
          personality: 'survivor_leader',
          dialogueStyle: 'apocalyptic',
          suspicionLevel: 0.9
        },
        'informant5': {
          personality: 'scavenger',
          dialogueStyle: 'desperate',
          suspicionLevel: 0.8
        },
        'target5': {
          personality: 'infected',
          dialogueStyle: 'erratic',
          suspicionLevel: 0.3
        }
      },
      bustMessage: "QUARANTINE BREACH! 🧟‍♂️",
      bustSubMessage: "Even in the apocalypse, there are rules! You've been contained!",
      jailMessage: "Locked in the safe zone. At least the zombies can't get you here... 🧟‍♀️",
      warningMessage: "The 'elimination' was actually a test to see if you'd break quarantine protocol!",
      conversationSet: 'A'
    },
    // Loop 6 - Medieval Fantasy (Set B)
    {
      id: 'medieval_fantasy',
      name: 'Medieval Fantasy Realm',
      description: 'Magical kingdom with castles, dragons, and ancient mysteries...',
      environment: {
        skyColor: 0x4169E1,
        fogColor: 0x9370DB,
        ambientLightIntensity: 0.6,
        directionalLightColor: 0xFFD700
      },
      playerOutfit: 'trench',
      npcAssignments: {
        jobGiver: {
          id: 'undercover6',
          name: 'Sir Gareth "The Royal Guard"',
          description: 'Knight in disguise testing your loyalty'
        },
        informant: {
          id: 'informant6',
          name: 'Mystic Mara "The Seer"',
          description: 'Fortune teller who sees all fates'
        },
        target: {
          id: 'target6',
          name: 'Lord Blackwood "The Accused"',
          description: 'Noble accused of treason against the crown'
        }
      },
      npcDialogueVariations: {
        'undercover6': {
          personality: 'royal_guard',
          dialogueStyle: 'medieval',
          suspicionLevel: 0.5
        },
        'informant6': {
          personality: 'tavern_wench',
          dialogueStyle: 'olde_english',
          suspicionLevel: 0.6
        },
        'target6': {
          personality: 'knight',
          dialogueStyle: 'chivalrous',
          suspicionLevel: 0.4
        }
      },
      specialEffects: ['magic_sparkles'],
      bustMessage: "BY THE CROWN! ⚔️👑",
      bustSubMessage: "Thou art under arrest for conspiracy against the realm!",
      jailMessage: "Thou art imprisoned in the castle dungeon. May the gods have mercy... 🏰",
      warningMessage: "The quest was a test of thy honor! The crown was watching all along!",
      conversationSet: 'B'
    }
  ];

  // Conversation templates that alternate between loops
  private conversationTemplates = {
    A: {
      jobGiver: {
        intro: {
          base: "Hey there, new face! You look like someone who could use some easy money. I've got a simple job if you're interested...",
          options: [
            { text: "What kind of job are we talking about?", nextId: 'details' },
            { text: "I'm listening... but I'm no pushover.", nextId: 'details' },
            { text: "Not interested in shady business.", action: 'end' }
          ]
        },
        details: {
          base: "There's this guy who's been causing problems for my... business associates. Need someone to send him a permanent message. You handle this, there's $5000 in it for you.",
          options: [
            { text: "Count me in. Where do I find him?", action: 'accept_mission' },
            { text: "That's murder. I'm not a killer.", action: 'refuse' },
            { text: "Five grand? Make it ten and we have a deal.", nextId: 'negotiate' }
          ]
        },
        negotiate: {
          base: "Ha! I like your style. Fine, ten grand it is. The target hangs around the east plaza. Red jacket, can't miss him.",
          options: [
            { text: "Deal. Consider it done.", action: 'accept_mission' }
          ]
        }
      },
      informant: {
        info: {
          base: "You're asking about someone, aren't you? I can see it in your eyes. Word of advice - this neighborhood has eyes and ears everywhere.",
          options: [
            { text: "I'm looking for a guy in a red jacket.", nextId: 'hint' },
            { text: "Just passing through.", action: 'end' },
            { text: "What kind of eyes and ears?", nextId: 'warning' }
          ]
        },
        hint: {
          base: "Red jacket guy? Yeah, I seen him. Usually hangs by the old fountain around evening time. But listen, honey... that area's been crawling with undercover cops lately.",
          options: [
            { text: "Thanks for the tip.", action: 'investigate' },
            { text: "Undercover cops? You sure?", nextId: 'warning' }
          ]
        }
      },
      target: {
        approach: {
          base: "You lost or something? This ain't exactly tourist territory, friend.",
          options: [
            { text: "Just exploring the neighborhood.", nextId: 'casual' },
            { text: "Someone sent me to find you.", nextId: 'threat' },
            { text: "Nice jacket. Where'd you get it?", nextId: 'casual' }
          ]
        },
        casual: {
          base: "Well, be careful around here. Lot of dangerous people in this area. Some of them aren't who they appear to be.",
          options: [
            { text: "What do you mean?", action: 'investigate' },
            { text: "Thanks for the warning.", action: 'end' }
          ]
        }
      }
    },
    B: {
      jobGiver: {
        intro: {
          base: "Listen up, I don't have much time. There's a situation that needs... handling. You interested in making some serious cash?",
          options: [
            { text: "Depends on what you need done.", nextId: 'details' },
            { text: "How serious are we talking?", nextId: 'details' },
            { text: "I don't do dirty work.", action: 'end' }
          ]
        },
        details: {
          base: "Someone's been talking to the wrong people, if you catch my drift. This person needs to disappear permanently. Twenty grand if you can make it happen tonight.",
          options: [
            { text: "Twenty grand? You've got my attention.", action: 'accept_mission' },
            { text: "That's a lot of money for a simple job...", nextId: 'negotiate' },
            { text: "Find someone else for your murder.", action: 'refuse' }
          ]
        },
        negotiate: {
          base: "Smart to be suspicious. But this is legitimate business. The target will be near the old warehouse district. Look for someone in distinctive clothing.",
          options: [
            { text: "Alright, I'm in. Give me the details.", action: 'accept_mission' }
          ]
        }
      },
      informant: {
        info: {
          base: "You've got that look... someone's paying you to find somebody, right? Well, information costs extra in this neighborhood.",
          options: [
            { text: "I need to find someone specific.", nextId: 'hint' },
            { text: "What's it to you?", nextId: 'warning' },
            { text: "I'm just looking around.", action: 'end' }
          ]
        },
        hint: {
          base: "Ah, the person you're looking for... yeah, I know where they hang out. But word of warning - there's been a lot of heat around here lately. Cops everywhere.",
          options: [
            { text: "Where can I find them?", action: 'investigate' },
            { text: "What kind of heat?", nextId: 'warning' }
          ]
        }
      },
      target: {
        approach: {
          base: "I don't know you. What do you want? This isn't a safe place to be wandering around.",
          options: [
            { text: "Just checking out the area.", nextId: 'casual' },
            { text: "I was told to find you.", nextId: 'threat' },
            { text: "You seem nervous about something.", nextId: 'casual' }
          ]
        },
        casual: {
          base: "Nervous? You should be nervous too. There's been strange people asking questions around here. I'd watch your back if I were you.",
          options: [
            { text: "What kind of strange people?", action: 'investigate' },
            { text: "Thanks for the heads up.", action: 'end' }
          ]
        }
      }
    }
  };

  public getTwistForLoop(loopNumber: number): GameTwist {
    const twistIndex = (loopNumber - 1) % this.twists.length;
    return this.twists[twistIndex];
  }

  public getAllTwists(): GameTwist[] {
    return [...this.twists];
  }

  public getRandomTwist(): GameTwist {
    const randomIndex = Math.floor(Math.random() * this.twists.length);
    return this.twists[randomIndex];
  }

  public generateTwistedDialogue(originalText: string, npcId: string, twist: GameTwist): string {
    const variation = twist.npcDialogueVariations[npcId];
    if (!variation) return originalText;

    // Apply dialogue style transformations
    switch (variation.dialogueStyle) {
      case 'noir':
        return this.applyNoirStyle(originalText);
      case 'western':
        return this.applyWesternStyle(originalText);
      case 'corporate':
        return this.applyCyberpunkStyle(originalText);
      case 'medieval':
        return this.applyMedievalStyle(originalText);
      case 'apocalyptic':
        return this.applyApocalypticStyle(originalText);
      default:
        return originalText;
    }
  }

  public getConversationTemplate(twist: GameTwist, npcType: 'jobGiver' | 'informant' | 'target', dialogueId: string): any {
    const template = this.conversationTemplates[twist.conversationSet];
    return template[npcType]?.[dialogueId];
  }

  private applyNoirStyle(text: string): string {
    return text
      .replace(/job/g, 'gig')
      .replace(/money/g, 'dough')
      .replace(/guy/g, 'mook')
      .replace(/Hey there/g, 'Listen here, doll')
      .replace(/problems/g, 'trouble')
      .replace(/business/g, 'racket');
  }

  private applyWesternStyle(text: string): string {
    return text
      .replace(/Hey there/g, 'Howdy, partner')
      .replace(/job/g, 'bounty')
      .replace(/money/g, 'gold')
      .replace(/guy/g, 'varmint')
      .replace(/problems/g, 'trouble')
      .replace(/business/g, 'dealings')
      .replace(/find/g, 'track down');
  }

  private applyCyberpunkStyle(text: string): string {
    return text
      .replace(/job/g, 'data contract')
      .replace(/money/g, 'credits')
      .replace(/guy/g, 'user')
      .replace(/Hey there/g, 'Greetings, citizen')
      .replace(/problems/g, 'system errors')
      .replace(/eliminate/g, 'delete')
      .replace(/find/g, 'locate via GPS');
  }

  private applyMedievalStyle(text: string): string {
    return text
      .replace(/Hey there/g, 'Hail and well met')
      .replace(/job/g, 'quest')
      .replace(/money/g, 'gold coins')
      .replace(/guy/g, 'knave')
      .replace(/problems/g, 'troubles')
      .replace(/business/g, 'affairs')
      .replace(/eliminate/g, 'vanquish')
      .replace(/find/g, 'seek out');
  }

  private applyApocalypticStyle(text: string): string {
    return text
      .replace(/Hey there/g, 'Survivor')
      .replace(/job/g, 'mission')
      .replace(/money/g, 'supplies')
      .replace(/guy/g, 'scavenger')
      .replace(/problems/g, 'threats')
      .replace(/business/g, 'survival')
      .replace(/eliminate/g, 'neutralize')
      .replace(/find/g, 'track');
  }
}
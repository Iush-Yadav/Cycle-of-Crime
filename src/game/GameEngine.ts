import * as THREE from 'three';
import { Player, NPC, GameState, Mission, GameData, DialogueNode } from '../types/GameTypes';

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private player: THREE.Group;
  private npcs: Map<string, THREE.Group> = new Map();
  private keys: Set<string> = new Set();
  private gameData: GameData;
  private callbacks: {
    onInteraction?: (npc: NPC) => void;
    onStateChange?: (newState: GameState) => void;
    onMissionUpdate?: (mission: Mission) => void;
  } = {};
  private clock: THREE.Clock;
  private playerSpeed = 0.15;
  private cameraOffset = new THREE.Vector3(0, 8, 12);
  private isJumping = false;
  private jumpVelocity = 0;
  private gravity = -0.02;
  private groundY = 0;
  private currentTwist: any = null;

  constructor() {
    console.log('Creating GameEngine...');
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: false,
      powerPreference: "high-performance"
    });
    this.clock = new THREE.Clock();
    
    this.initializeGame();
    this.setupEventListeners();
    this.animate();
    console.log('GameEngine created successfully');
  }

  private initializeGame() {
    console.log('Initializing game...');
    
    // Setup renderer with bright settings
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.setClearColor(0x87CEEB, 1); // Default sky blue background
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    this.renderer.toneMappingExposure = 1.5;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Setup scene with fog for atmosphere
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);

    // Setup lighting first
    this.setupBrightLighting();
    
    // Create environment
    this.createBrightEnvironment();
    this.createPlayer();

    // Initialize game data
    this.gameData = {
      player: {
        id: 'player1',
        username: '',
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        outfit: 'street',
        health: 100,
        currentLoop: 1,
        gameState: GameState.IDLE
      },
      npcs: [],
      isDialogueActive: false,
      inventory: []
    };

    console.log('Game initialized');
  }

  public applyTwist(twist: any) {
    console.log('Applying twist:', twist.name);
    this.currentTwist = twist;

    // Update environment colors
    this.renderer.setClearColor(twist.environment.skyColor, 1);
    this.scene.fog = new THREE.Fog(twist.environment.fogColor, 50, 200);

    // Update lighting
    this.updateLightingForTwist(twist);

    // Add special effects
    if (twist.specialEffects) {
      this.addSpecialEffects(twist.specialEffects);
    }

    // Regenerate NPCs with new twist data
    this.regenerateNPCs(twist);

    console.log('Twist applied successfully');
  }

  private regenerateNPCs(twist: any) {
    console.log('Regenerating NPCs for twist:', twist.name);
    
    // Clear existing NPCs
    this.npcs.forEach(npc => {
      this.scene.remove(npc);
    });
    this.npcs.clear();

    // Create new NPCs based on twist assignments
    const assignments = twist.npcAssignments;
    
    const npcData = [
      { 
        id: assignments.jobGiver.id, 
        name: assignments.jobGiver.name,
        pos: [10, 0, 10], 
        color: this.getNPCColorByType('undercover', twist), 
        type: 'undercover' 
      },
      { 
        id: assignments.informant.id, 
        name: assignments.informant.name,
        pos: [-15, 0, 5], 
        color: this.getNPCColorByType('informant', twist), 
        type: 'informant' 
      },
      { 
        id: assignments.target.id, 
        name: assignments.target.name,
        pos: [25, 0, -10], 
        color: this.getNPCColorByType('target', twist), 
        type: 'target' 
      }
    ];

    npcData.forEach(({ id, name, pos, color, type }) => {
      const npc = new THREE.Group();
      
      // Create NPC model based on twist theme
      this.createNPCModel(npc, type, color, twist);

      npc.position.set(pos[0], 0, pos[2]);
      
      // Add floating name tag with the correct name
      this.createNameTag(npc, name.split(' ')[0]); // Use first name only
      
      this.scene.add(npc);
      this.npcs.set(id, npc);
    });

    console.log('NPCs regenerated with new identities');
  }

  private createNPCModel(npc: THREE.Group, type: string, color: number, twist: any) {
    // Base NPC body
    const bodyGeometry = new THREE.CapsuleGeometry(0.4, 1.3);
    const bodyMaterial = new THREE.MeshLambertMaterial({ color });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 0.85;
    body.castShadow = true;
    npc.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(0.25);
    const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDDAA });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.y = 1.8;
    head.castShadow = true;
    npc.add(head);

    // Add special styling based on type and twist
    this.addNPCSpecialFeatures(npc, type, twist);
  }

  private addNPCSpecialFeatures(npc: THREE.Group, type: string, twist: any) {
    switch (type) {
      case 'target':
        // Always add distinctive clothing for target
        const jacketGeometry = new THREE.BoxGeometry(0.9, 1.4, 0.45);
        let jacketColor = 0xCC0000; // Default red
        
        // Vary jacket color based on twist
        switch (twist.id) {
          case 'rainy_night':
            jacketColor = 0x4A4A4A; // Dark gray raincoat
            break;
          case 'neon_cyberpunk':
            jacketColor = 0x00FFFF; // Cyan cyber jacket
            break;
          case 'desert_western':
            jacketColor = 0x8B4513; // Brown leather vest
            break;
          case 'zombie_apocalypse':
            jacketColor = 0x654321; // Dirty brown survival gear
            break;
          case 'medieval_fantasy':
            jacketColor = 0x4B0082; // Purple noble robes
            break;
          default:
            jacketColor = 0xCC0000; // Red jacket
        }
        
        const jacketMaterial = new THREE.MeshLambertMaterial({ color: jacketColor });
        const jacket = new THREE.Mesh(jacketGeometry, jacketMaterial);
        jacket.position.y = 1;
        jacket.castShadow = true;
        npc.add(jacket);
        break;
        
      case 'undercover':
        // Add accessories based on twist theme
        if (twist.id === 'neon_cyberpunk') {
          // Add glowing visor
          const visorGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.05);
          const visorMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FFFF, 
            transparent: true, 
            opacity: 0.8 
          });
          const visor = new THREE.Mesh(visorGeometry, visorMaterial);
          visor.position.set(0, 1.85, 0.2);
          npc.add(visor);
        } else if (twist.id === 'desert_western') {
          // Add cowboy hat
          const hatGeometry = new THREE.CylinderGeometry(0.35, 0.25, 0.15);
          const hatMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
          const hat = new THREE.Mesh(hatGeometry, hatMaterial);
          hat.position.set(0, 2.1, 0);
          npc.add(hat);
        }
        break;
        
      case 'informant':
        // Add distinctive features for informants
        if (twist.id === 'medieval_fantasy') {
          // Add mystical crystal
          const crystalGeometry = new THREE.OctahedronGeometry(0.1);
          const crystalMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x9370DB, 
            transparent: true, 
            opacity: 0.7 
          });
          const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
          crystal.position.set(0, 2.2, 0);
          npc.add(crystal);
        }
        break;
    }
  }

  private getNPCColorByType(type: string, twist: any): number {
    const baseColors = {
      'undercover': 0x444444,
      'informant': 0x666600,
      'target': 0x660000
    };

    // Modify colors based on twist theme
    switch (twist.id) {
      case 'neon_cyberpunk':
        return {
          'undercover': 0x1a1a2e,
          'informant': 0x16213e,
          'target': 0x0f3460
        }[type] || baseColors[type];
      case 'desert_western':
        return {
          'undercover': 0x8B4513,
          'informant': 0xD2691E,
          'target': 0x654321
        }[type] || baseColors[type];
      case 'zombie_apocalypse':
        return {
          'undercover': 0x2F4F2F,
          'informant': 0x556B2F,
          'target': 0x8B4513
        }[type] || baseColors[type];
      case 'medieval_fantasy':
        return {
          'undercover': 0x4B0082,
          'informant': 0x8B008B,
          'target': 0x9932CC
        }[type] || baseColors[type];
      default:
        return baseColors[type];
    }
  }

  private updateLightingForTwist(twist: any) {
    // Remove existing lights
    const lightsToRemove: THREE.Light[] = [];
    this.scene.traverse((child) => {
      if (child instanceof THREE.Light) {
        lightsToRemove.push(child);
      }
    });
    lightsToRemove.forEach(light => this.scene.remove(light));

    // Add new lighting based on twist
    const ambientLight = new THREE.AmbientLight(0xffffff, twist.environment.ambientLightIntensity);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(twist.environment.directionalLightColor, 1.2);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Add special lighting for certain twists
    if (twist.id === 'neon_cyberpunk') {
      // Add neon lights
      const neonColors = [0xFF00FF, 0x00FFFF, 0xFF0080, 0x8000FF];
      neonColors.forEach((color, i) => {
        const neonLight = new THREE.PointLight(color, 2, 30);
        neonLight.position.set(
          (i - 1.5) * 20,
          5,
          (i % 2 === 0 ? 1 : -1) * 15
        );
        this.scene.add(neonLight);
      });
    } else if (twist.id === 'zombie_apocalypse') {
      // Add eerie red lighting
      const redLight = new THREE.PointLight(0xFF0000, 1.5, 50);
      redLight.position.set(0, 20, 0);
      this.scene.add(redLight);
    }
  }

  private addSpecialEffects(effects: string[]) {
    effects.forEach(effect => {
      switch (effect) {
        case 'rain':
          this.createRainEffect();
          break;
        case 'neon_glow':
          this.createNeonGlowEffect();
          break;
        case 'dust_storm':
          this.createDustStormEffect();
          break;
        case 'magic_sparkles':
          this.createMagicSparklesEffect();
          break;
      }
    });
  }

  private createRainEffect() {
    const rainGeometry = new THREE.BufferGeometry();
    const rainCount = 1000;
    const positions = new Float32Array(rainCount * 3);

    for (let i = 0; i < rainCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 200;     // x
      positions[i + 1] = Math.random() * 100;         // y
      positions[i + 2] = (Math.random() - 0.5) * 200; // z
    }

    rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const rainMaterial = new THREE.PointsMaterial({
      color: 0x6699CC,
      size: 0.5,
      transparent: true,
      opacity: 0.6
    });

    const rain = new THREE.Points(rainGeometry, rainMaterial);
    this.scene.add(rain);

    // Animate rain falling
    const animateRain = () => {
      const positions = rain.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] -= 2; // Fall speed
        if (positions[i] < 0) {
          positions[i] = 100; // Reset to top
        }
      }
      rain.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animateRain);
    };
    animateRain();
  }

  private createNeonGlowEffect() {
    // Add glowing particles
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 100;
      positions[i + 1] = Math.random() * 50;
      positions[i + 2] = (Math.random() - 0.5) * 100;

      // Neon colors
      const neonColors = [
        [1, 0, 1], // Magenta
        [0, 1, 1], // Cyan
        [1, 0, 0.5], // Pink
        [0.5, 0, 1]  // Purple
      ];
      const colorSet = neonColors[Math.floor(Math.random() * neonColors.length)];
      colors[i] = colorSet[0];
      colors[i + 1] = colorSet[1];
      colors[i + 2] = colorSet[2];
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMaterial = new THREE.PointsMaterial({
      size: 2,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    this.scene.add(particles);
  }

  private createDustStormEffect() {
    const dustGeometry = new THREE.BufferGeometry();
    const dustCount = 500;
    const positions = new Float32Array(dustCount * 3);

    for (let i = 0; i < dustCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 150;
      positions[i + 1] = Math.random() * 30;
      positions[i + 2] = (Math.random() - 0.5) * 150;
    }

    dustGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const dustMaterial = new THREE.PointsMaterial({
      color: 0xDEB887,
      size: 1.5,
      transparent: true,
      opacity: 0.4
    });

    const dust = new THREE.Points(dustGeometry, dustMaterial);
    this.scene.add(dust);

    // Animate dust blowing
    const animateDust = () => {
      dust.rotation.y += 0.01;
      const positions = dust.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += Math.sin(Date.now() * 0.001 + i) * 0.1;
        positions[i + 2] += Math.cos(Date.now() * 0.001 + i) * 0.1;
      }
      dust.geometry.attributes.position.needsUpdate = true;
      requestAnimationFrame(animateDust);
    };
    animateDust();
  }

  private createMagicSparklesEffect() {
    const sparkleGeometry = new THREE.BufferGeometry();
    const sparkleCount = 100;
    const positions = new Float32Array(sparkleCount * 3);

    for (let i = 0; i < sparkleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 80;
      positions[i + 1] = Math.random() * 40 + 5;
      positions[i + 2] = (Math.random() - 0.5) * 80;
    }

    sparkleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const sparkleMaterial = new THREE.PointsMaterial({
      color: 0xFFD700,
      size: 3,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    });

    const sparkles = new THREE.Points(sparkleGeometry, sparkleMaterial);
    this.scene.add(sparkles);

    // Animate sparkles twinkling
    const animateSparkles = () => {
      sparkles.rotation.y += 0.005;
      sparkleMaterial.opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.4;
      requestAnimationFrame(animateSparkles);
    };
    animateSparkles();
  }

  private setupBrightLighting() {
    console.log('Setting up lighting...');
    
    // Very bright ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    this.scene.add(ambientLight);

    // Bright directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    this.scene.add(directionalLight);

    // Additional hemisphere light for even lighting
    const hemisphereLight = new THREE.HemisphereLight(0x87CEEB, 0x654321, 0.6);
    this.scene.add(hemisphereLight);

    // Point lights for extra illumination
    const pointLight1 = new THREE.PointLight(0xffffff, 1, 50);
    pointLight1.position.set(20, 20, 20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 50);
    pointLight2.position.set(-20, 20, -20);
    this.scene.add(pointLight2);

    console.log('Lighting setup complete');
  }

  private createBrightEnvironment() {
    console.log('Creating environment...');
    
    // Bright ground
    const groundGeometry = new THREE.PlaneGeometry(200, 200);
    const groundMaterial = new THREE.MeshLambertMaterial({ 
      color: 0x90EE90, // Light green
      transparent: false
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // Colorful buildings
    this.createColorfulBuildings();
    
    // Bright streets
    this.createBrightStreets();
    
    // Environmental details
    this.createEnvironmentalDetails();

    console.log('Environment created');
  }

  private createColorfulBuildings() {
    const buildings = [
      { pos: [25, 0, 25], size: [12, 20, 12], color: 0xFF6B6B }, // Red
      { pos: [-25, 0, 25], size: [15, 25, 10], color: 0x4ECDC4 }, // Teal
      { pos: [35, 0, -35], size: [18, 30, 12], color: 0x45B7D1 }, // Blue
      { pos: [-35, 0, -25], size: [12, 22, 15], color: 0xF9CA24 }, // Yellow
      { pos: [0, 0, 45], size: [20, 15, 8], color: 0x6C5CE7 }, // Purple
      { pos: [-45, 0, 0], size: [10, 18, 20], color: 0xA0E7E5 } // Light blue
    ];

    buildings.forEach(({ pos, size, color }) => {
      // Main building
      const geometry = new THREE.BoxGeometry(size[0], size[1], size[2]);
      const material = new THREE.MeshLambertMaterial({ color });
      const building = new THREE.Mesh(geometry, material);
      building.position.set(pos[0], size[1] / 2, pos[2]);
      building.castShadow = true;
      building.receiveShadow = true;
      this.scene.add(building);

      // Bright windows
      const windowMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xFFFFAA, // Bright yellow
        transparent: true,
        opacity: 0.9
      });
      
      // Add windows
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < Math.floor(size[1] / 4); j++) {
          const windowGeometry = new THREE.PlaneGeometry(1.5, 1.5);
          const window = new THREE.Mesh(windowGeometry, windowMaterial);
          window.position.set(
            pos[0] + (i - 1) * 3,
            j * 4 + 3,
            pos[2] + size[2] / 2 + 0.01
          );
          this.scene.add(window);
        }
      }
    });
  }

  private createBrightStreets() {
    // Bright gray streets
    const streetMaterial = new THREE.MeshLambertMaterial({ color: 0xC0C0C0 }); // Light gray
    
    // Horizontal street
    const street1Geometry = new THREE.BoxGeometry(200, 0.2, 12);
    const street1 = new THREE.Mesh(street1Geometry, streetMaterial);
    street1.position.y = 0.1;
    street1.receiveShadow = true;
    this.scene.add(street1);

    // Vertical street
    const street2Geometry = new THREE.BoxGeometry(12, 0.2, 200);
    const street2 = new THREE.Mesh(street2Geometry, streetMaterial);
    street2.position.y = 0.1;
    street2.receiveShadow = true;
    this.scene.add(street2);

    // White sidewalks
    const sidewalkMaterial = new THREE.MeshLambertMaterial({ color: 0xF0F0F0 });
    
    // Sidewalk borders
    [-8, 8].forEach(offset => {
      const sidewalk1 = new THREE.Mesh(
        new THREE.BoxGeometry(200, 0.15, 2),
        sidewalkMaterial
      );
      sidewalk1.position.set(0, 0.075, offset);
      sidewalk1.receiveShadow = true;
      this.scene.add(sidewalk1);

      const sidewalk2 = new THREE.Mesh(
        new THREE.BoxGeometry(2, 0.15, 200),
        sidewalkMaterial
      );
      sidewalk2.position.set(offset, 0.075, 0);
      sidewalk2.receiveShadow = true;
      this.scene.add(sidewalk2);
    });
  }

  private createEnvironmentalDetails() {
    // Colorful trash cans
    for (let i = 0; i < 8; i++) {
      const trashGeometry = new THREE.CylinderGeometry(0.5, 0.6, 1.2);
      const trashMaterial = new THREE.MeshLambertMaterial({ 
        color: [0x2ECC71, 0xE74C3C, 0x3498DB, 0xF39C12][i % 4] // Green, red, blue, orange
      });
      const trash = new THREE.Mesh(trashGeometry, trashMaterial);
      trash.position.set(
        (Math.random() - 0.5) * 80,
        0.6,
        (Math.random() - 0.5) * 80
      );
      trash.castShadow = true;
      this.scene.add(trash);
    }

    // Bright benches
    for (let i = 0; i < 4; i++) {
      const benchGroup = new THREE.Group();
      
      // Bench seat
      const seatGeometry = new THREE.BoxGeometry(3, 0.2, 0.8);
      const seatMaterial = new THREE.MeshLambertMaterial({ color: 0xD2691E }); // Chocolate brown
      const seat = new THREE.Mesh(seatGeometry, seatMaterial);
      seat.position.y = 0.5;
      benchGroup.add(seat);

      // Bench back
      const backGeometry = new THREE.BoxGeometry(3, 1, 0.1);
      const back = new THREE.Mesh(backGeometry, seatMaterial);
      back.position.set(0, 1, -0.35);
      benchGroup.add(back);

      // Metal legs
      [-1.2, 1.2].forEach(x => {
        const legGeometry = new THREE.BoxGeometry(0.1, 0.5, 0.1);
        const legMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 }); // Slate gray
        const leg = new THREE.Mesh(legGeometry, legMaterial);
        leg.position.set(x, 0.25, 0.3);
        benchGroup.add(leg);
      });

      benchGroup.position.set(
        (Math.random() - 0.5) * 60,
        0,
        (Math.random() - 0.5) * 60
      );
      benchGroup.castShadow = true;
      this.scene.add(benchGroup);
    }

    // Add some trees for color
    for (let i = 0; i < 6; i++) {
      const treeGroup = new THREE.Group();
      
      // Tree trunk
      const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4);
      const trunkMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
      const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
      trunk.position.y = 2;
      treeGroup.add(trunk);

      // Tree leaves
      const leavesGeometry = new THREE.SphereGeometry(2.5);
      const leavesMaterial = new THREE.MeshLambertMaterial({ color: 0x228B22 });
      const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
      leaves.position.y = 5;
      treeGroup.add(leaves);

      treeGroup.position.set(
        (Math.random() - 0.5) * 100,
        0,
        (Math.random() - 0.5) * 100
      );
      treeGroup.castShadow = true;
      this.scene.add(treeGroup);
    }
  }

  private createPlayer() {
    console.log('Creating player...');
    this.player = new THREE.Group();
    
    // Create character based on the reference image
    this.createCharacterModel();

    this.scene.add(this.player);
    
    // Camera setup (third person, fixed position)
    this.updateCamera();
    console.log('Player created');
  }

  private createCharacterModel() {
    // Character proportions based on the reference
    const skinColor = 0xFFDBAC;
    const hairColor = 0x2D1810;
    const hoodieColor = 0x8B0000; // Dark red hoodie
    const jeansColor = 0x1A1A2E; // Dark jeans
    const shoeColor = 0x2D5016; // Green sneakers

    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 1.8, 0);
    head.castShadow = true;
    this.player.add(head);

    // Hair (spiky style from reference)
    const hairGeometry = new THREE.SphereGeometry(0.38, 16, 16);
    const hairMaterial = new THREE.MeshLambertMaterial({ color: hairColor });
    const hair = new THREE.Mesh(hairGeometry, hairMaterial);
    hair.position.set(0, 1.9, 0);
    hair.scale.set(1, 0.8, 1);
    hair.castShadow = true;
    this.player.add(hair);

    // Hair spikes
    for (let i = 0; i < 6; i++) {
      const spikeGeometry = new THREE.ConeGeometry(0.08, 0.3, 6);
      const spike = new THREE.Mesh(spikeGeometry, hairMaterial);
      const angle = (i / 6) * Math.PI * 2;
      spike.position.set(
        Math.cos(angle) * 0.25,
        2.1,
        Math.sin(angle) * 0.25
      );
      spike.rotation.z = Math.cos(angle) * 0.3;
      spike.rotation.x = Math.sin(angle) * 0.3;
      spike.castShadow = true;
      this.player.add(spike);
    }

    // Torso (hoodie)
    const torsoGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.4);
    const torsoMaterial = new THREE.MeshLambertMaterial({ color: hoodieColor });
    const torso = new THREE.Mesh(torsoGeometry, torsoMaterial);
    torso.position.set(0, 1, 0);
    torso.castShadow = true;
    this.player.add(torso);

    // Hood (when up)
    const hoodGeometry = new THREE.SphereGeometry(0.45, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const hood = new THREE.Mesh(hoodGeometry, torsoMaterial);
    hood.position.set(0, 1.8, -0.1);
    hood.castShadow = true;
    this.player.add(hood);

    // Arms
    [-0.6, 0.6].forEach((x, index) => {
      const armGeometry = new THREE.CapsuleGeometry(0.15, 0.8);
      const arm = new THREE.Mesh(armGeometry, torsoMaterial);
      arm.position.set(x, 1, 0);
      arm.castShadow = true;
      this.player.add(arm);

      // Hands
      const handGeometry = new THREE.SphereGeometry(0.12);
      const handMaterial = new THREE.MeshLambertMaterial({ color: skinColor });
      const hand = new THREE.Mesh(handGeometry, handMaterial);
      hand.position.set(x, 0.4, 0);
      hand.castShadow = true;
      this.player.add(hand);
    });

    // Legs (ripped jeans)
    [-0.25, 0.25].forEach(x => {
      const legGeometry = new THREE.CapsuleGeometry(0.18, 0.9);
      const legMaterial = new THREE.MeshLambertMaterial({ color: jeansColor });
      const leg = new THREE.Mesh(legGeometry, legMaterial);
      leg.position.set(x, 0.1, 0);
      leg.castShadow = true;
      this.player.add(leg);

      // Rips in jeans (lighter patches)
      const ripGeometry = new THREE.PlaneGeometry(0.15, 0.08);
      const ripMaterial = new THREE.MeshLambertMaterial({ 
        color: 0x4A4A6A,
        transparent: true,
        opacity: 0.8
      });
      const rip = new THREE.Mesh(ripGeometry, ripMaterial);
      rip.position.set(x, 0.3, 0.19);
      this.player.add(rip);
    });

    // Shoes (green sneakers)
    [-0.25, 0.25].forEach(x => {
      const shoeGeometry = new THREE.BoxGeometry(0.3, 0.15, 0.6);
      const shoeMaterial = new THREE.MeshLambertMaterial({ color: shoeColor });
      const shoe = new THREE.Mesh(shoeGeometry, shoeMaterial);
      shoe.position.set(x, -0.35, 0.1);
      shoe.castShadow = true;
      this.player.add(shoe);

      // Shoe details (white stripes)
      const stripeGeometry = new THREE.BoxGeometry(0.32, 0.02, 0.1);
      const stripeMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
      const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
      stripe.position.set(x, -0.28, 0.1);
      this.player.add(stripe);
    });
  }

  private createNameTag(npc: THREE.Group, name: string) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.8)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = 'white';
    context.font = '24px Arial';
    context.textAlign = 'center';
    context.fillText(name, canvas.width / 2, canvas.height / 2 + 8);
    
    const texture = new THREE.CanvasTexture(canvas);
    const material = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(material);
    sprite.position.y = 3;
    sprite.scale.set(2, 0.5, 1);
    npc.add(sprite);
  }

  private setupEventListeners() {
    // Keyboard events - NO MOUSE CONTROLS
    window.addEventListener('keydown', (event) => {
      this.keys.add(event.code.toLowerCase());
      
      // Jump with spacebar
      if (event.code === 'Space' && !this.isJumping) {
        this.jump();
      }
      
      // Interaction key
      if (event.code === 'KeyE') {
        this.checkInteractions();
      }

      // Prevent default for game keys
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'KeyE', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
    });

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.code.toLowerCase());
    });

    // Resize handler
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Prevent context menu
    window.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private jump() {
    if (!this.isJumping && this.player.position.y <= this.groundY + 0.1) {
      this.isJumping = true;
      this.jumpVelocity = 0.3; // Initial jump velocity
    }
  }

  private updatePlayer() {
    let moved = false;
    const direction = new THREE.Vector3();

    // Calculate movement direction
    if (this.keys.has('keyw')) {
      direction.z -= 1;
      moved = true;
    }
    if (this.keys.has('keys')) {
      direction.z += 1;
      moved = true;
    }
    if (this.keys.has('keya')) {
      direction.x -= 1;
      moved = true;
    }
    if (this.keys.has('keyd')) {
      direction.x += 1;
      moved = true;
    }

    if (moved) {
      // Normalize direction and apply speed
      direction.normalize().multiplyScalar(this.playerSpeed);
      
      // Apply movement
      this.player.position.add(direction);
      
      // Rotate player to face movement direction
      if (direction.length() > 0) {
        const angle = Math.atan2(direction.x, direction.z);
        this.player.rotation.y = angle;
      }
    }

    // Handle jumping physics
    if (this.isJumping) {
      this.player.position.y += this.jumpVelocity;
      this.jumpVelocity += this.gravity;

      // Check if landed
      if (this.player.position.y <= this.groundY) {
        this.player.position.y = this.groundY;
        this.isJumping = false;
        this.jumpVelocity = 0;
      }
    }

    // Update camera (fixed third-person view)
    this.updateCamera();
    
    // Update game data
    this.gameData.player.position = {
      x: this.player.position.x,
      y: this.player.position.y,
      z: this.player.position.z
    };
  }

  private updateCamera() {
    // Fixed third-person camera that follows the player
    const idealOffset = new THREE.Vector3(0, 8, 12);
    const idealPosition = this.player.position.clone().add(idealOffset);
    
    // Smooth camera movement
    this.camera.position.lerp(idealPosition, 0.1);
    this.camera.lookAt(this.player.position.clone().add(new THREE.Vector3(0, 1, 0)));
  }

  private checkInteractions() {
    const playerPos = this.player.position;
    const interactionDistance = 4;

    this.gameData.npcs.forEach(npc => {
      const npcPos = npc.position;
      const distance = Math.sqrt(
        Math.pow(playerPos.x - npcPos.x, 2) +
        Math.pow(playerPos.z - npcPos.z, 2)
      );

      if (distance < interactionDistance && this.callbacks.onInteraction) {
        this.callbacks.onInteraction(npc);
      }
    });
  }

  private animate = () => {
    requestAnimationFrame(this.animate);
    
    const delta = this.clock.getDelta();
    
    this.updatePlayer();
    
    // Animate NPCs (simple idle animation)
    this.npcs.forEach(npc => {
      npc.rotation.y += Math.sin(Date.now() * 0.001) * 0.01;
    });
    
    this.renderer.render(this.scene, this.camera);
  };

  public setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = callbacks;
  }

  public getGameData(): GameData {
    return this.gameData;
  }

  public updateGameState(newState: GameState) {
    this.gameData.player.gameState = newState;
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange(newState);
    }
  }

  public setPlayerData(player: Partial<Player>) {
    this.gameData.player = { ...this.gameData.player, ...player };
    
    // Update visual appearance based on outfit
    if (player.outfit) {
      this.updatePlayerOutfit(player.outfit);
    }
  }

  public updateNPCData(npcs: NPC[]) {
    this.gameData.npcs = npcs;
  }

  private updatePlayerOutfit(outfit: string) {
    // This would update the player's visual appearance
    // For now, we'll just change the hoodie color
    const torso = this.player.children.find(child => 
      child instanceof THREE.Mesh && 
      (child.geometry as any).type === 'BoxGeometry'
    ) as THREE.Mesh;
    
    if (torso && torso.material instanceof THREE.MeshLambertMaterial) {
      switch (outfit) {
        case 'street':
          torso.material.color.setHex(0x8b0000); // Dark red
          break;
        case 'trench':
          torso.material.color.setHex(0x1a1a1a); // Black
          break;
        case 'prison':
          torso.material.color.setHex(0xff6600); // Orange
          break;
        case 'casual':
          torso.material.color.setHex(0x4169e1); // Blue
          break;
      }
    }
  }

  public getDOMElement(): HTMLCanvasElement {
    return this.renderer.domElement;
  }

  public getInteractionPrompt(): string | undefined {
    const playerPos = this.player.position;
    const interactionDistance = 4;

    for (const npc of this.gameData.npcs) {
      const npcPos = npc.position;
      const distance = Math.sqrt(
        Math.pow(playerPos.x - npcPos.x, 2) +
        Math.pow(playerPos.z - npcPos.z, 2)
      );

      if (distance < interactionDistance) {
        return `Talk to ${npc.name.split(' ')[0]}`;
      }
    }

    return undefined;
  }

  public dispose() {
    this.renderer.dispose();
    this.scene.clear();
  }
}
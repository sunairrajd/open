// import { useRef, useEffect } from "react";
// import {
//   Renderer,
//   Camera,
//   Transform,
//   Plane,
//   Mesh,
//   Program,
//   Texture,
// } from "ogl";

// type GL = Renderer["gl"];

// // Define proper types for debounce function
// type EventHandler<T extends Event = Event> = (event: T) => void;

// function debounce<T extends Event>(func: EventHandler<T>, wait: number): EventHandler<T> {
//   let timeoutId: NodeJS.Timeout;
//   return (event: T) => {
//     clearTimeout(timeoutId);
//     timeoutId = setTimeout(() => func(event), wait);
//   };
// }

// function lerp(p1: number, p2: number, t: number): number {
//   return p1 + (p2 - p1) * t;
// }

// // Define proper interface for bindable objects
// interface Bindable {
//   [key: string]: ((...args: unknown[]) => unknown) | unknown;
// }

// function autoBind(instance: Bindable): void {
//   const proto = Object.getPrototypeOf(instance);
//   Object.getOwnPropertyNames(proto).forEach((key) => {
//     if (key !== "constructor" && typeof instance[key] === "function") {
//       instance[key] = instance[key].bind(instance);
//     }
//   });
// }

// function getFontSize(font: string): number {
//   const match = font.match(/(\d+)px/);
//   return match ? parseInt(match[1], 10) : 30;
// }

// function createTextTexture(
//   gl: GL,
//   text: string,
//   font: string = "bold 30px monospace",
//   color: string = "black",
// ): { texture: Texture; width: number; height: number } {
//   const canvas = document.createElement("canvas");
//   const context = canvas.getContext("2d");
//   if (!context) throw new Error("Could not get 2d context");

//   context.font = font;
//   const metrics = context.measureText(text);
//   const textWidth = Math.ceil(metrics.width);
//   const fontSize = getFontSize(font);
//   const textHeight = Math.ceil(fontSize * 1.2);

//   canvas.width = textWidth + 20;
//   canvas.height = textHeight + 20;

//   context.font = font;
//   context.fillStyle = color;
//   context.textBaseline = "middle";
//   context.textAlign = "center";
//   context.clearRect(0, 0, canvas.width, canvas.height);
//   context.fillText(text, canvas.width / 2, canvas.height / 2);

//   const texture = new Texture(gl, { generateMipmaps: false });
//   texture.image = canvas;
//   return { texture, width: canvas.width, height: canvas.height };
// }

// interface ScreenSize {
//   width: number;
//   height: number;
// }

// interface Viewport {
//   width: number;
//   height: number;
// }

// interface MediaProps {
//   geometry: Plane;
//   gl: GL;
//   image: string;
//   index: number;
//   length: number;
//   renderer: Renderer;
//   scene: Transform;
//   screen: ScreenSize;
//   text: string;
//   viewport: Viewport;
//   bend: number;
//   textColor: string;
//   borderRadius?: number;
//   font?: string;
// }

// class Media {
//   extra: number = 0;
//   geometry: Plane;
//   gl: GL;
//   image: string;
//   index: number;
//   length: number;
//   renderer: Renderer;
//   scene: Transform;
//   screen: ScreenSize;
//   text: string;
//   viewport: Viewport;
//   bend: number;
//   textColor: string;
//   borderRadius: number;
//   font?: string;
//   program!: Program;
//   plane!: Mesh;
//   scale!: number;
//   padding!: number;
//   width!: number;
//   widthTotal!: number;
//   x!: number;
//   speed: number = 0;
//   isBefore: boolean = false;
//   isAfter: boolean = false;

//   constructor({
//     geometry,
//     gl,
//     image,
//     index,
//     length,
//     renderer,
//     scene,
//     screen,
//     text,
//     viewport,
//     bend,
//     textColor,
//     borderRadius = 0,
//     font,
//   }: MediaProps) {
//     this.geometry = geometry;
//     this.gl = gl;
//     this.image = image;
//     this.index = index;
//     this.length = length;
//     this.renderer = renderer;
//     this.scene = scene;
//     this.screen = screen;
//     this.text = text;
//     this.viewport = viewport;
//     this.bend = bend;
//     this.textColor = textColor;
//     this.borderRadius = borderRadius;
//     this.font = font;
//     this.createShader();
//     this.createMesh();
//     this.onResize();
//   }

//   createShader() {
//     const texture = new Texture(this.gl, {
//       generateMipmaps: true,
//       minFilter: this.gl.LINEAR_MIPMAP_LINEAR,
//       magFilter: this.gl.LINEAR,
//       anisotropy: 16,
//       premultiplyAlpha: true,
//       flipY: true
//     });
//     this.program = new Program(this.gl, {
//       depthTest: false,
//       depthWrite: false,
//       vertex: `
//         precision highp float;
//         attribute vec3 position;
//         attribute vec2 uv;
//         uniform mat4 modelViewMatrix;
//         uniform mat4 projectionMatrix;
//         uniform float uTime;
//         uniform float uSpeed;
//         varying vec2 vUv;
//         void main() {
//           vUv = uv;
//           vec3 p = position;
//           p.z = (sin(p.x * 4.0 + uTime) * 1.0 + cos(p.y * 2.0 + uTime) * 1.0) * (0.05 + uSpeed * 0.3);
//           gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
//         }
//       `,
//       fragment: `
//         precision highp float;
//         uniform vec2 uImageSizes;
//         uniform vec2 uPlaneSizes;
//         uniform sampler2D tMap;
//         uniform float uBorderRadius;
//         varying vec2 vUv;
        
//         float roundedBoxSDF(vec2 p, vec2 b, float r) {
//           vec2 d = abs(p) - b + vec2(r);
//           return min(max(d.x, d.y), 0.0) + length(max(d, 0.0)) - r;
//         }
        
//         void main() {
//           vec2 ratio = vec2(
//             min((uPlaneSizes.x / uPlaneSizes.y) / (uImageSizes.x / uImageSizes.y), 1.0),
//             min((uPlaneSizes.y / uPlaneSizes.x) / (uImageSizes.y / uImageSizes.x), 1.0)
//           );
//           vec2 uv = vec2(
//             vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
//             vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
//           );
          
//           vec4 color = texture2D(tMap, uv);
          
//           float d = roundedBoxSDF(vUv - 0.5, vec2(0.5 - uBorderRadius), uBorderRadius);
//           float alpha = 1.0 - smoothstep(-0.002, 0.002, d);
          
//           gl_FragColor = vec4(color.rgb, alpha);
//         }
//       `,
//       uniforms: {
//         tMap: { value: texture },
//         uPlaneSizes: { value: [0, 0] },
//         uImageSizes: { value: [0, 0] },
//         uSpeed: { value: 0 },
//         uTime: { value: 100 * Math.random() },
//         uBorderRadius: { value: this.borderRadius },
//       },
//       transparent: true,
//     });

//     const img = new Image();
//     img.crossOrigin = "anonymous";
//     img.src = this.image;
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d');
//       if (!ctx) return;

//       const size = Math.pow(2, Math.ceil(Math.log2(Math.max(img.width, img.height))));
//       canvas.width = size;
//       canvas.height = size;

//       ctx.imageSmoothingEnabled = true;
//       ctx.imageSmoothingQuality = 'high';

//       const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
//       const x = (canvas.width - img.width * scale) / 2;
//       const y = (canvas.height - img.height * scale) / 2;
//       ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

//       texture.image = canvas;
//       this.program.uniforms.uImageSizes.value = [img.naturalWidth, img.naturalHeight];
//     };
//   }

//   createMesh() {
//     this.plane = new Mesh(this.gl, {
//       geometry: this.geometry,
//       program: this.program,
//     });
//     this.plane.setParent(this.scene);
//   }

//   update(
//     scroll: { current: number; last: number },
//     direction: "right" | "left",
//   ) {
//     this.plane.position.x = this.x - scroll.current - this.extra;

//     const x = this.plane.position.x;
//     const H = this.viewport.width / 2;

//     if (this.bend === 0) {
//       this.plane.position.y = 0;
//       this.plane.rotation.z = 0;
//     } else {
//       const B_abs = Math.abs(this.bend);
//       const R = (H * H + B_abs * B_abs) / (2 * B_abs);
//       const effectiveX = Math.min(Math.abs(x), H);

//       const arc = R - Math.sqrt(R * R - effectiveX * effectiveX);
//       if (this.bend > 0) {
//         this.plane.position.y = -arc;
//         this.plane.rotation.z = -Math.sign(x) * Math.asin(effectiveX / R);
//       } else {
//         this.plane.position.y = arc;
//         this.plane.rotation.z = Math.sign(x) * Math.asin(effectiveX / R);
//       }
//     }

//     this.speed = scroll.current - scroll.last;
//     this.program.uniforms.uTime.value += 0.02;
//     this.program.uniforms.uSpeed.value = this.speed;

//     const planeOffset = this.plane.scale.x / 2;
//     const viewportOffset = this.viewport.width / 2;
//     this.isBefore = this.plane.position.x + planeOffset < -viewportOffset;
//     this.isAfter = this.plane.position.x - planeOffset > viewportOffset;
//     if (direction === "right" && this.isBefore) {
//       this.extra -= this.widthTotal;
//       this.isBefore = this.isAfter = false;
//     }
//     if (direction === "left" && this.isAfter) {
//       this.extra += this.widthTotal;
//       this.isBefore = this.isAfter = false;
//     }
//   }

//   onResize({
//     screen,
//     viewport,
//   }: { screen?: ScreenSize; viewport?: Viewport } = {}) {
//     if (screen) this.screen = screen;
//     if (viewport) {
//       this.viewport = viewport;
//       if (this.plane.program.uniforms.uViewportSizes) {
//         this.plane.program.uniforms.uViewportSizes.value = [
//           this.viewport.width,
//           this.viewport.height,
//         ];
//       }
//     }
//     this.scale = this.screen.height / 1500;
//     this.plane.scale.y =
//       (this.viewport.height * (900 * this.scale)) / this.screen.height;
//     this.plane.scale.x =
//       (this.viewport.width * (700 * this.scale)) / this.screen.width;
//     this.plane.program.uniforms.uPlaneSizes.value = [
//       this.plane.scale.x,
//       this.plane.scale.y,
//     ];
//     this.padding = 2;
//     this.width = this.plane.scale.x + this.padding;
//     this.widthTotal = this.width * this.length;
//     this.x = this.width * this.index;
//   }
// }

// interface AppConfig {
//   items?: { image: string; text: string }[];
//   bend?: number;
//   textColor?: string;
//   borderRadius?: number;
//   font?: string;
// }

// class App implements Bindable {
//   container: HTMLElement;
//   scroll: {
//     ease: number;
//     current: number;
//     target: number;
//     last: number;
//     position?: number;
//   };
//   onCheckDebounce: EventHandler;
//   renderer!: Renderer;
//   gl!: GL;
//   camera!: Camera;
//   scene!: Transform;
//   planeGeometry!: Plane;
//   medias: Media[] = [];
//   mediasImages: { image: string; text: string }[] = [];
//   screen!: { width: number; height: number };
//   viewport!: { width: number; height: number };
//   raf: number = 0;

//   boundOnResize: EventHandler;
//   boundOnWheel: EventHandler<WheelEvent>;
//   boundOnTouchDown: EventHandler<MouseEvent | TouchEvent>;
//   boundOnTouchMove: EventHandler<MouseEvent | TouchEvent>;
//   boundOnTouchUp: EventHandler;

//   isDown: boolean = false;
//   start: number = 0;
//   autoScrollSpeed: number = 0.02;
//   isAutoScrolling: boolean = true;

//   [key: string]: ((...args: unknown[]) => unknown) | unknown;

//   constructor(
//     container: HTMLElement,
//     {
//       items = [],
//       bend = 1,
//       textColor = "#ffffff",
//       borderRadius = 0.05,
//       font = "bold 30px DM Sans",
//     }: AppConfig = {}
//   ) {
//     this.container = container;
//     this.scroll = { ease: 0.03, current: 0, target: 0, last: 0 };
    
//     // Bind event handlers
//     this.boundOnResize = () => this.onResize();
//     this.boundOnWheel = (event: WheelEvent) => this.onWheel(event);
//     this.boundOnTouchDown = (event: MouseEvent | TouchEvent) => this.onTouchDown(event);
//     this.boundOnTouchMove = (event: MouseEvent | TouchEvent) => this.onTouchMove(event);
//     this.boundOnTouchUp = (event: Event) => this.onTouchUp(event);
    
//     this.onCheckDebounce = debounce((event: Event) => {
//       if (event instanceof WheelEvent || event instanceof MouseEvent || event instanceof TouchEvent) {
//         this.onCheck(event);
//       }
//     }, 200);

//     this.createRenderer();
//     this.createCamera();
//     this.createScene();
//     this.onResize();
//     this.createGeometry();
//     this.createMedias(items, bend, textColor, borderRadius, font);
//     this.update();
//     this.addEventListeners();
//   }

//   createRenderer() {
//     this.renderer = new Renderer({
//       alpha: true,
//       antialias: true,
//       dpr: Math.min(window.devicePixelRatio, 2),
//       powerPreference: 'high-performance'
//     });
//     this.gl = this.renderer.gl;
//     this.gl.clearColor(0, 0, 0, 0);

//     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR);
//     this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);

//     const canvas = this.renderer.gl.canvas as HTMLCanvasElement;
//     canvas.style.width = '100%';
//     canvas.style.height = '100%';
//     this.container.appendChild(canvas);
//   }

//   createCamera() {
//     this.camera = new Camera(this.gl);
//     this.camera.fov = 45;
//     this.camera.position.z = 20;
//   }

//   createScene() {
//     this.scene = new Transform();
//   }

//   createGeometry() {
//     this.planeGeometry = new Plane(this.gl, {
//       heightSegments: 100,
//       widthSegments: 150,
//     });
//   }

//   createMedias(
//     items: { image: string; text: string }[] | undefined,
//     bend: number = 1,
//     textColor: string,
//     borderRadius: number,
//     font: string,
//   ) {
//     const defaultItems = [
//       {
//         image: `https://picsum.photos/seed/1/800/600?grayscale`,
//         text: "Bridge",
//       },
//       {
//         image: `https://picsum.photos/seed/2/800/600?grayscale`,
//         text: "Desk Setup",
//       },
//       {
//         image: `https://picsum.photos/seed/3/800/600?grayscale`,
//         text: "Waterfall",
//       },
//       {
//         image: `https://picsum.photos/seed/4/800/600?grayscale`,
//         text: "Strawberries",
//       },
//       {
//         image: `https://picsum.photos/seed/5/800/600?grayscale`,
//         text: "Deep Diving",
//       },
//       {
//         image: `https://picsum.photos/seed/16/800/600?grayscale`,
//         text: "Train Track",
//       },
//       {
//         image: `https://picsum.photos/seed/17/800/600?grayscale`,
//         text: "Santorini",
//       },
//       {
//         image: `https://picsum.photos/seed/8/800/600?grayscale`,
//         text: "Blurry Lights",
//       },
//       {
//         image: `https://picsum.photos/seed/9/800/600?grayscale`,
//         text: "New York",
//       },
//       {
//         image: `https://picsum.photos/seed/10/800/600?grayscale`,
//         text: "Good Boy",
//       },
//       {
//         image: `https://picsum.photos/seed/21/800/600?grayscale`,
//         text: "Coastline",
//       },
//       {
//         image: `https://picsum.photos/seed/12/800/600?grayscale`,
//         text: "Palm Trees",
//       },
//     ];
//     const galleryItems = items && items.length ? items : defaultItems;
//     this.mediasImages = galleryItems.concat(galleryItems);
//     this.medias = this.mediasImages.map((data, index) => {
//       return new Media({
//         geometry: this.planeGeometry,
//         gl: this.gl,
//         image: data.image,
//         index,
//         length: this.mediasImages.length,
//         renderer: this.renderer,
//         scene: this.scene,
//         screen: this.screen,
//         text: data.text,
//         viewport: this.viewport,
//         bend,
//         textColor,
//         borderRadius,
//         font,
//       });
//     });
//   }

//   onWheel(event: WheelEvent): void {
//     this.scroll.target += 0.5;
//     this.onCheckDebounce(event);
//   }

//   onTouchDown(event: MouseEvent | TouchEvent): void {
//     this.isAutoScrolling = false;
//     this.isDown = true;
//     this.scroll.position = this.scroll.current;
//     this.start = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
//   }

//   onTouchMove(event: MouseEvent | TouchEvent): void {
//     if (!this.isDown) return;
//     const x = event instanceof TouchEvent ? event.touches[0].clientX : event.clientX;
//     const distance = (this.start - x) * 0.05;
//     this.scroll.target = (this.scroll.position ?? 0) + distance;
//     this.onCheckDebounce(event);
//   }

//   onTouchUp(event: Event): void {
//     this.isDown = false;
//     this.onCheck(event);
//     setTimeout(() => {
//       this.isAutoScrolling = true;
//     }, 2000);
//   }

//   onCheck(event: Event): void {
//     if (!this.medias || !this.medias[0]) return;
//     const width = this.medias[0].width;
//     const itemIndex = Math.round(Math.abs(this.scroll.target) / width);
//     const item = width * itemIndex;
//     this.scroll.target = this.scroll.target < 0 ? -item : item;
//   }

//   onResize(): void {
//     const width = this.container.clientWidth;
//     const height = this.container.clientHeight;

//     this.screen = {
//       width: width,
//       height: height
//     };

//     this.renderer.setSize(width, height);
//     this.renderer.gl.canvas.style.width = `${width}px`;
//     this.renderer.gl.canvas.style.height = `${height}px`;

//     this.camera.perspective({
//       aspect: width / height,
//     });

//     const fov = (this.camera.fov * Math.PI) / 180;
//     const height_1 = 2 * Math.tan(fov / 2) * this.camera.position.z;
//     const width_1 = height_1 * (width / height);
//     this.viewport = { width: width_1, height: height_1 };

//     if (this.medias) {
//       this.medias.forEach((media) =>
//         media.onResize({ screen: this.screen, viewport: this.viewport })
//       );
//     }
//   }

//   update() {
//     this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    
//     if (this.isAutoScrolling) {
//       this.scroll.target += this.autoScrollSpeed;
//     }
    
//     this.scroll.current = lerp(
//       this.scroll.current,
//       this.scroll.target,
//       this.scroll.ease
//     );
    
//     const direction = this.scroll.current > this.scroll.last ? "right" : "left";
    
//     if (this.medias) {
//       this.medias.forEach((media) => media.update(this.scroll, direction));
//     }
    
//     this.renderer.render({
//       scene: this.scene,
//       camera: this.camera,
//       clear: true
//     });
    
//     this.scroll.last = this.scroll.current;
//     this.raf = window.requestAnimationFrame(this.update.bind(this));
//   }

//   addEventListeners(): void {
//     window.addEventListener("resize", this.boundOnResize);
//     window.addEventListener("wheel", this.boundOnWheel);
//     window.addEventListener("mousedown", this.boundOnTouchDown);
//     window.addEventListener("mousemove", this.boundOnTouchMove);
//     window.addEventListener("mouseup", this.boundOnTouchUp);
//     window.addEventListener("touchstart", this.boundOnTouchDown);
//     window.addEventListener("touchmove", this.boundOnTouchMove);
//     window.addEventListener("touchend", this.boundOnTouchUp);
//   }

//   destroy() {
//     window.cancelAnimationFrame(this.raf);
//     window.removeEventListener("resize", this.boundOnResize);
//     window.removeEventListener("wheel", this.boundOnWheel);
//     window.removeEventListener("mousedown", this.boundOnTouchDown);
//     window.removeEventListener("mousemove", this.boundOnTouchMove);
//     window.removeEventListener("mouseup", this.boundOnTouchUp);
//     window.removeEventListener("touchstart", this.boundOnTouchDown);
//     window.removeEventListener("touchmove", this.boundOnTouchMove);
//     window.removeEventListener("touchend", this.boundOnTouchUp);
//     if (
//       this.renderer &&
//       this.renderer.gl &&
//       this.renderer.gl.canvas.parentNode
//     ) {
//       this.renderer.gl.canvas.parentNode.removeChild(
//         this.renderer.gl.canvas as HTMLCanvasElement,
//       );
//     }
//   }
// }

// interface CircularGalleryProps {
//   items?: { image: string; text: string }[];
//   bend?: number;
//   textColor?: string;
//   borderRadius?: number;
//   font?: string;
// }

// export default function CircularGallery({
//   items,
//   bend = 3,
//   textColor = "#ffffff",
//   borderRadius = 0.05,
//   font = "bold 30px DM Sans",
// }: CircularGalleryProps) {
//   const containerRef = useRef<HTMLDivElement>(null);
//   useEffect(() => {
//     if (!containerRef.current) return;
//     const app = new App(containerRef.current, {
//       items,
//       bend,
//       textColor,
//       borderRadius,
//       font,
//     });
//     return () => {
//       app.destroy();
//     };
//   }, [items, bend, textColor, borderRadius, font]);
//   return (
//     <div
//       className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
//       ref={containerRef}
//     />
//   );
// }

import React, { useRef, useState, useEffect } from 'react';
import profileImg from '../../assets/image/izal_profile_portrait.png';

const InteractiveLanyard: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const pathRef = useRef<SVGPathElement>(null);
    const shadowPathRef = useRef<SVGPathElement>(null);

    // Physics parameters
    const L = 340; // Cord length in pixels (hangs from top edge of screen)
    const gravity = 0.65; // Normal gravity pull
    const damping = 0.972; // Air friction resistance (increased for faster settle)

    // State center anchor X
    const [anchorX, setAnchorX] = useState(200);

    // Physics coordinates for top clip of the card (px, py)
    const pxRef = useRef(0); // Card center X
    const pyRef = useRef(L + 155); // Card center Y
    const vxRef = useRef(0);
    const vyRef = useRef(0);

    // Card rotation angle (theta) and angular velocity (vtheta)
    const thetaRef = useRef(0);
    const vthetaRef = useRef(0);

    // Drag tracking refs
    const isDraggingRef = useRef(false);
    const pointerIdRef = useRef<number | null>(null);

    // Grab point parameters relative to top clip
    const dragOffsetRef = useRef({ x: 0, y: 155 });
    const D_grabRef = useRef(155); // Distance from card center to pointer grab point
    const dragRotateRef = useRef(0); // Current rotation of the card
    
    const localGrabXRef = useRef(0);
    const localGrabYRef = useRef(155);

    const lastPxRef = useRef(0);
    const lastPyRef = useRef(L + 155);
    const lastThetaRef = useRef(0);

    // Mouse coordinates relative to anchor point
    const mouseRef = useRef({ x: 0, y: L + 155 });

    // Update anchor center point on container resize
    useEffect(() => {
        if (!containerRef.current) return;
        const updateAnchor = () => {
            setAnchorX(containerRef.current!.offsetWidth / 2);
        };
        updateAnchor();
        window.addEventListener('resize', updateAnchor);
        return () => window.removeEventListener('resize', updateAnchor);
    }, []);

    // Custom physics loop using requestAnimationFrame
    useEffect(() => {
        let animationFrameId: number;

        const updatePhysics = () => {
            let px = pxRef.current;
            let py = pyRef.current;
            let vx = vxRef.current;
            let vy = vyRef.current;
            let theta = thetaRef.current;
            let vtheta = vthetaRef.current;

            const isDragging = isDraggingRef.current;

            if (isDragging) {
                // KINEMATIC DRAG STATE: Card is locked directly to mouse, no forces calculated
                px = pxRef.current;
                py = pyRef.current;
                theta = dragRotateRef.current;

                // Calculate instantaneous velocities based on frame-to-frame displacement
                vx = px - lastPxRef.current;
                vy = py - lastPyRef.current;
                vtheta = theta - lastThetaRef.current;

                // Clamp velocities to prevent physics explosion on release
                vx = Math.max(Math.min(vx, 16), -16);
                vy = Math.max(Math.min(vy, 16), -16);
                vtheta = Math.max(Math.min(vtheta, 0.2), -0.2);

                // Update tracking refs
                lastPxRef.current = px;
                lastPyRef.current = py;
                lastThetaRef.current = theta;

                vxRef.current = vx;
                vyRef.current = vy;
                vthetaRef.current = vtheta;
                thetaRef.current = theta;
            } else {
                // DYNAMIC FREE-HANGING STATE: Normal gravity pendulum simulation
                vy += gravity;

                px += vx;
                py += vy;

                // String constraint on top clip (rigid projection)
                const cosT = Math.cos(theta);
                const sinT = Math.sin(theta);
                const clipOffsetY = -155;
                const rcx = -clipOffsetY * sinT;
                const rcy = clipOffsetY * cosT;
                
                const cx = px + rcx;
                const cy = py + rcy;

                const d_clip = Math.sqrt(cx * cx + cy * cy);
                if (d_clip > L) {
                    const nx = cx / d_clip;
                    const ny = cy / d_clip;

                    // 1. Snap position rigidly to cord length L (no stretch)
                    const cx_clamped = nx * L;
                    const cy_clamped = ny * L;
                    px = cx_clamped - rcx;
                    py = cy_clamped - rcy;

                    // 2. Project velocity to cancel radial stretching speed
                    const cvx = vx - vtheta * rcy;
                    const cvy = vy + vtheta * rcx;
                    const velNormal = cvx * nx + cvy * ny;

                    if (velNormal > 0) {
                        const restitution = 0.05; // extremely tiny rebound bounce
                        const correctionX = (-restitution * velNormal - velNormal) * nx;
                        const correctionY = (-restitution * velNormal - velNormal) * ny;

                        vx += correctionX;
                        vy += correctionY;
                        vtheta += (rcx * correctionY - rcy * correctionX) * 0.00005; // torque impulse
                    }
                }

                // Air resistance friction
                vx *= damping;
                vy *= damping;
                vtheta *= 0.94; // Rotational damping

                pxRef.current = px;
                pyRef.current = py;
                vxRef.current = vx;
                vyRef.current = vy;
                
                theta += vtheta;
                thetaRef.current = theta;
                dragRotateRef.current = theta; // Keep in sync
            }

            // Render directly to DOM elements
            if (cardRef.current && pathRef.current && shadowPathRef.current) {
                const cardLeft = anchorX + px - 100; // Center card (width 200px)
                const cardTop = py - 155; // Height 310px

                cardRef.current.style.left = `${cardLeft}px`;
                cardRef.current.style.top = `${cardTop}px`;
                cardRef.current.style.transform = `rotate(${theta * (180 / Math.PI)}deg) rotateY(${vx * 0.15}deg)`;
                cardRef.current.style.transformOrigin = 'center center';

                // Render string path (slack or taut)
                const cosT = Math.cos(theta);
                const sinT = Math.sin(theta);
                const clipOffsetY = -155;
                const rcx = -clipOffsetY * sinT;
                const rcy = clipOffsetY * cosT;
                
                const cx_world = px + rcx;
                const cy_world = py + rcy;
                const d_clip_now = Math.sqrt(cx_world * cx_world + cy_world * cy_world);

                let pathD = '';
                if (d_clip_now >= L - 4) {
                    pathD = `M ${anchorX} 0 L ${anchorX + cx_world} ${cy_world}`;
                } else {
                    const cpX = anchorX + cx_world * 0.5;
                    const cpY = (cy_world * 0.5) + (L - d_clip_now) * 0.5;
                    pathD = `M ${anchorX} 0 Q ${cpX} ${cpY} ${anchorX + cx_world} ${cy_world}`;
                }

                pathRef.current.setAttribute('d', pathD);
                shadowPathRef.current.setAttribute('d', pathD);
            }

            animationFrameId = requestAnimationFrame(updatePhysics);
        };

        animationFrameId = requestAnimationFrame(updatePhysics);
        return () => cancelAnimationFrame(animationFrameId);
    }, [anchorX]);

    // Handle Pointer Down
    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;

        // Capture pointer events outside bounds
        e.currentTarget.setPointerCapture(e.pointerId);
        pointerIdRef.current = e.pointerId;
        isDraggingRef.current = true;

        const rect = containerRef.current.getBoundingClientRect();
        
        // Mouse cursor relative to center top anchor
        const cursorX = e.clientX - (rect.left + anchorX);
        const cursorY = e.clientY - rect.top;

        // Current coordinates
        const px = pxRef.current;
        const py = pyRef.current;
        const theta = thetaRef.current;

        // Vector from card center to cursor (world space)
        const wdx = cursorX - px;
        const wdy = cursorY - py;

        // Transform to local space (inverse rotation matrix)
        const cosT = Math.cos(theta);
        const sinT = Math.sin(theta);

        localGrabXRef.current = wdx * cosT + wdy * sinT;
        localGrabYRef.current = -wdx * sinT + wdy * cosT;

        dragOffsetRef.current = { x: wdx, y: wdy };
        D_grabRef.current = Math.max(Math.sqrt(wdx * wdx + wdy * wdy), 0.1);

        lastPxRef.current = px;
        lastPyRef.current = py;
        lastThetaRef.current = theta;

        vxRef.current = 0;
        vyRef.current = 0;
        vthetaRef.current = 0;

        mouseRef.current = { x: cursorX, y: cursorY };
    };

    // Handle Pointer Move: Kinematic Solver
    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const mouseX = e.clientX - (rect.left + anchorX);
        const mouseY = e.clientY - rect.top;

        mouseRef.current = { x: mouseX, y: mouseY };

        // Card center target based on mouse cursor and click offset
        const targetX = mouseX - dragOffsetRef.current.x;
        const targetY = mouseY - dragOffsetRef.current.y;

        const R1 = L; // Circle 1 radius (cord length)
        const R2 = D_grabRef.current; // Circle 2 radius (grab distance)
        const gx = mouseX; // Circle 2 center X (pointer location)
        const gy = mouseY; // Circle 2 center Y

        // Calculate card top clip for default orientation
        const cx_test = targetX;
        const cy_test = targetY - 155;
        const d_test = Math.sqrt(cx_test * cx_test + cy_test * cy_test);

        if (d_test > L) {
            // String is taut: Circle-Circle intersection solver
            const d_mg = Math.sqrt(gx * gx + gy * gy);
            let cx = 0;
            let cy = L;

            if (d_mg > R1 + R2) {
                // Mouse pulled too far
                cx = (gx / d_mg) * R1;
                cy = (gy / d_mg) * R1;
            } else if (d_mg > 0.001) {
                const a = (R1 * R1 - R2 * R2 + d_mg * d_mg) / (2 * d_mg);
                const h = Math.sqrt(Math.max(0, R1 * R1 - a * a));

                const px_mid = a * (gx / d_mg);
                const py_mid = a * (gy / d_mg);

                const cx1 = px_mid + h * (gy / d_mg);
                const cy1 = py_mid - h * (gx / d_mg);
                const cx2 = px_mid - h * (gy / d_mg);
                const cy2 = py_mid + h * (gx / d_mg);

                const prevCx = pxRef.current;
                const prevCy = pyRef.current - 155;
                const dist1 = (cx1 - prevCx) * (cx1 - prevCx) + (cy1 - prevCy) * (cy1 - prevCy);
                const dist2 = (cx2 - prevCx) * (cx2 - prevCx) + (cy2 - prevCy) * (cy2 - prevCy);

                if (dist1 < dist2) {
                    cx = cx1;
                    cy = cy1;
                } else {
                    cx = cx2;
                    cy = cy2;
                }
            }

            // Calculate card rotation so the grab point stays under cursor
            const angleRad = Math.atan2(gx - cx, gy - cy) - Math.atan2(dragOffsetRef.current.x, dragOffsetRef.current.y);
            dragRotateRef.current = angleRad;

            // Offset of clip from center under current rotation
            const cosT = Math.cos(angleRad);
            const sinT = Math.sin(angleRad);
            const clipOffsetY = -155;
            const rcx = -clipOffsetY * sinT;
            const rcy = clipOffsetY * cosT;

            pxRef.current = cx - rcx;
            pyRef.current = cy - rcy;
        } else {
            // String is slack: card moves freely, rotation relaxes to upright
            pxRef.current = targetX;
            pyRef.current = targetY;
            
            // Slowly interpolate rotation to 0 (upright)
            dragRotateRef.current = dragRotateRef.current * 0.9;
        }
    };

    // Handle Pointer Release
    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = false;
        if (pointerIdRef.current !== null) {
            e.currentTarget.releasePointerCapture(pointerIdRef.current);
            pointerIdRef.current = null;
        }
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-full relative z-30 pointer-events-none select-none min-h-[460px] lg:min-h-[500px]"
        >
            {/* SVG Cord Layer (Dynamic Hanging String) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible">
                {/* Shadow path */}
                <path
                    ref={shadowPathRef}
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.45)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    className="translate-y-[1.5px] translate-x-[0.5px]"
                />
                {/* Main cord path */}
                <path
                    ref={pathRef}
                    fill="none"
                    stroke="rgba(6, 182, 212, 0.4)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                {/* Top hanging hook */}
                <circle cx={anchorX} cy="3" r="5.5" fill="#1c1c1c" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
            </svg>

            {/* Draggable Lanyard ID Card */}
            <div
                ref={cardRef}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
                onDragStart={(e) => e.preventDefault()}
                className="absolute w-[200px] h-[310px] bg-neutral-900/90 border border-white/15 rounded-2xl flex flex-col items-center p-4 shadow-[0_25px_60px_rgba(0,0,0,0.85)] z-30 select-none backdrop-blur-md pointer-events-auto cursor-grab active:cursor-grabbing hover:border-cyan-500/30 transition-colors duration-300 touch-none"
            >
                {/* Shiny holographic tag strip */}
                <div className="absolute right-3.5 top-3 w-3 h-14 bg-gradient-to-b from-cyan-400/35 via-purple-500/25 to-transparent rounded-full opacity-40 mix-blend-overlay pointer-events-none" />

                {/* Top card clip attachment */}
                <div className="absolute top-[-9px] left-[50%] -translate-x-[50%] w-6.5 h-4.5 bg-neutral-800 rounded-md border border-white/20 flex items-center justify-center shadow-md z-40 pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#060606] border border-white/10" />
                </div>

                {/* Card Title Header */}
                <span className="text-[8px] font-mono tracking-[0.25em] text-neutral-400 font-bold uppercase mb-3">
                    CREATIVE PASS
                </span>

                {/* Profile Avatar Frame */}
                <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 mb-3 bg-[#060606] relative shadow-inner">
                    <img 
                        src={profileImg} 
                        className="w-full h-full object-cover scale-x-[-1]" 
                        alt="Baharuddin Izha Al Sya'na Avatar" 
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#060606]/35 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Name Label */}
                <h3 className="font-bebas text-lg tracking-wider text-white uppercase leading-none mb-1.5 text-center">
                    B. Izha Al Sya'na
                </h3>

                {/* Role Description */}
                <p className="text-[9px] font-mono text-cyan-400/80 leading-none mb-4 uppercase">
                    3D Generalist & AI Dev
                </p>

                {/* Custom Barcode footer */}
                <div className="mt-auto w-full flex flex-col items-center border-t border-white/5 pt-2">
                    <div className="h-5 w-full flex items-center justify-center opacity-40 mb-1 space-x-[1px]">
                        <div className="h-full w-[2px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[3px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[4px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[2px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[3px] bg-white" />
                        <div className="h-full w-[1px] bg-white" />
                        <div className="h-full w-[2px] bg-white" />
                    </div>
                    <span className="text-[7px] font-mono tracking-widest text-neutral-500 uppercase">
                        ID-962026-ZH
                    </span>
                </div>
            </div>
        </div>
    );
};

export default InteractiveLanyard;

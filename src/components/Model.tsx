"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Model: React.FC = (props) => {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/Model/shoemodel.glb") as any;

  // Continuous rotation + floating
  useFrame((state, delta) => {
    if (group.current) {
      // Spin on Y-axis
      group.current.rotation.y += delta * 0.6;

      // Gentle floating up & down
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.05;
    }
  });

  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={10}
      position={[0, 0, 0]}
      rotation={[0.4, 0.9, 3.14]} // angled side view like in your image
    >
      <mesh
        castShadow
        receiveShadow
        geometry={
          nodes
            .Travis_x_Scott_Cactus_Jack_x_Air_Jordan_4_High_Retro_mat_00_mat_0003_0
            .geometry
        }
        material={materials["mat_0.003"]}
      /> 
    </group>
  );
};

useGLTF.preload("/Model/shoemodel.glb");

export default Model;

"use client";
import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const Model: React.FC = (props) => {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF("/Model/shoemodel.glb") as any;

  useFrame((state, delta) => {
    if (group.current) {
      group.current.rotation.y += delta * 0.5; // Slow rotation
    }
  });

  return (
    <group ref={group} {...props} dispose={null} scale={2} position={[0, -1.5, 0]}>
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

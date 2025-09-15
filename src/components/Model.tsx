"use client";
import React, { useRef } from "react";
import { useGLTF} from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type GLTFResult = GLTF & {
  nodes: {
    Travis_x_Scott_Cactus_Jack_x_Air_Jordan_4_High_Retro_mat_00_mat_0003_0: THREE.Mesh;
  };
  materials: {
    ["mat_0.003"]: THREE.MeshStandardMaterial;
  };
};

const Model: React.FC = (props) => {
  const group = useRef<THREE.Group>(null);
  const { nodes, materials } = useGLTF(
    "/model/shoemodel.glb"
  ) as unknown as GLTFResult;



  return (
    <group
      ref={group}
      {...props}
      dispose={null}
      scale={14}
      position={[0, 0, 0]}
     rotation={[0.15, -1.4, 3.14]}

 // angled side view like in your image
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

useGLTF.preload("/models/shoemodel.glb");

export default Model;

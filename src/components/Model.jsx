import React, { useRef } from "react";
import { useGLTF } from "@react-three/drei";

const Model = (props) => {
  const { nodes, materials } = useGLTF("/public/Model/shoemodel.glb");
  return (
    <group {...props} dispose={null}>
      <group rotation={[-Math.PI / 2, 0, 0]}>
        <group rotation={[Math.PI / 2, 0, 0]} scale={0.01}>
          <mesh
            castShadow
            receiveShadow
            geometry={
              nodes
                .Travis_x_Scott_Cactus_Jack_x_Air_Jordan_4_High_Retro_mat_00_mat_0003_0
                .geometry
            }
            material={materials["mat_0.003"]}
            position={[0, 16.6079, 8.0066]}
            rotation={[-2.9056, 0, 0]}
            scale={222.8143}
          />
        </group>
      </group>
    </group>
  );
};

useGLTF.preload("/public/Model/shoemodel.glb");

export default Model;

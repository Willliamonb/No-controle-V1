import React from "react";
import { Tabs } from "expo-router";
import { Text } from "react-native";

// Componente de ícone para a tab bar
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#16A34A",
        tabBarInactiveTintColor: "#8A8578",
        tabBarStyle: { 
          backgroundColor: "#FFFFFF", 
          borderTopColor: "#F0EEE6",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
        },
      }}
    >
      {/* Tela 1: Dashboard */}
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Início",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />

      {/* Tela 2: Dívidas */}
      <Tabs.Screen
        name="debts/index"
        options={{
          title: "Dívidas",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📋" focused={focused} />,
        }}
      />

      {/* Tela 3: Plano (NOVA ROTA) */}
      <Tabs.Screen
        name="plan"
        options={{
          title: "Plano",
          tabBarIcon: ({ focused }) => <TabIcon emoji="🎯" focused={focused} />,
        }}
      />

      {/* Tela 4: Progresso */}
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progresso",
          tabBarIcon: ({ focused }) => <TabIcon emoji="📈" focused={focused} />,
        }}
      />

      {/* Tela 5: Perfil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />

      {/* ============================================ */}
      {/* ROTAS OCULTAS (acessíveis por navegação direta) */}
      {/* ============================================ */}

      {/* Nova dívida - oculta da tab bar */}
      <Tabs.Screen
        name="debts/new"
        options={{
          href: null, // Oculta da tab bar
          title: "Nova Dívida",
        }}
      />

      {/* Detalhe da dívida - oculta da tab bar */}
      <Tabs.Screen
        name="debts/[id]"
        options={{
          href: null, // Oculta da tab bar
          title: "Detalhes",
        }}
      />

      {/* Assistente - oculto da tab bar (acessível via botão) */}
      <Tabs.Screen
        name="assistant"
        options={{
          href: null, // Oculta da tab bar
          title: "Assistente",
        }}
      />
    </Tabs>
  );
}
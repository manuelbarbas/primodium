import { Navigator } from "src/components/core/Navigator";

export const BuildingMenu: React.FC = () => {
  return (
    <Navigator>
      <Navigator.Breadcrumbs />
      <Navigator.Screen title="Home">
        This is a test
        <Navigator.NavButton to="Test">Test</Navigator.NavButton>
      </Navigator.Screen>
      <Navigator.Screen title="Test">
        This is a different test
        <Navigator.NavButton to="Test2">test2</Navigator.NavButton>
        <Navigator.NavButton to="Home">Home</Navigator.NavButton>
      </Navigator.Screen>
      <Navigator.Screen title="Test2">
        Screen 3<Navigator.NavButton to="Home">Home</Navigator.NavButton>
      </Navigator.Screen>

      <Navigator.BackButton />
    </Navigator>
  );
};

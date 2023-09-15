import { ReactNode, FC } from 'react';

interface CollapseProps {
  children?: ReactNode;
}

const CollapseTitle: FC<CollapseProps> = ({ children }) => {
  return (
    <div className="collapse-title text-xl font-medium">
      {children}
    </div>
  );
};

const CollapseContent: FC<CollapseProps> = ({ children }) => {
  return (
    <div className="collapse-content">
      {children}
    </div>
  );
};

const Collapse: FC<CollapseProps> & {
  Title: typeof CollapseTitle;
  Content: typeof CollapseContent;
} = ({ children }) => {
  return (
    <div className="collapse bg-base-200">
      <input type="checkbox" />
      {children}
    </div>
  );
};

Collapse.Title = CollapseTitle;
Collapse.Content = CollapseContent;

export default Collapse;

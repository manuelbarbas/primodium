import { ReactNode, FC } from 'react';

interface JoinProps {
  className?: string;
  direction?: 'vertical' | 'horizontal';
  children?: ReactNode;
}

const JoinItem: FC<JoinProps> = ({ children }) => {
  return (
    <div className="join-item">
      {children}
    </div>
  );
};

const Join: FC<JoinProps> & {
  Item: typeof JoinItem;
} = ({ className, direction = 'horizontal', children }) => {
  return (
    <div className={`join ${className} ${direction === 'horizontal' ? 'join-horizontal' : 'join-vertical'}`}>
      {children}
    </div>
  );
};

Join.Item = JoinItem;

export default Join;

import Image from 'next/image';

interface IconProps {
  name: string;
  size?: number;
  className?: string;
  alt?: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

const Icon = ({ 
  name, 
  size = 24, 
  className = '', 
  alt, 
  backgroundColor = 'transparent',
  padding = 0,
  borderRadius = 0
}: IconProps) => {
  return (
    <div 
      className={className}
      style={{ 
        width: size + (padding * 2), 
        height: size + (padding * 2),
        backgroundColor,
        padding: padding,
        borderRadius: borderRadius,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        src={`/icons/${name}.svg`}
        alt={alt || `${name} icon`}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Icon;

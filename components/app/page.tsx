const Page: FC<{
  key: string;
}> = ({
  key,
  children
}) => (
  <div data-page={key}>{children}</div>
);

export default Page;
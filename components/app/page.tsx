const Page: FC<{
  slug: string;
}> = ({
  slug,
  children
}) => (
  <div data-page={slug}>{children}</div>
);

export default Page;
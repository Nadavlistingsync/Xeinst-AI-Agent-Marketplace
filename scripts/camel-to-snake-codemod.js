/**
 * jscodeshift codemod to replace camelCase property names with snake_case equivalents.
 * Only replaces identifiers, object keys, and property accesses.
 */

const mapping = {
  imageUrl: 'image_url',
  averageRating: 'average_rating',
  totalRatings: 'total_ratings',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  fileUrl: 'file_url',
  accessLevel: 'access_level',
  deployedBy: 'deployed_by',
  userId: 'user_id',
  productId: 'product_id',
  downloadCount: 'download_count',
  earningsSplit: 'earnings_split',
};

module.exports = function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Replace object property keys (shorthand and quoted)
  root.find(j.Property)
    .forEach(path => {
      const key = path.node.key;
      if (key.type === 'Identifier' && mapping[key.name]) {
        path.node.key = j.identifier(mapping[key.name]);
      } else if (key.type === 'Literal' && mapping[key.value]) {
        path.node.key = j.literal(mapping[key.value]);
      }
    });

  // Replace member expressions (obj.imageUrl → obj.image_url)
  root.find(j.MemberExpression)
    .forEach(path => {
      if (
        path.node.property.type === 'Identifier' &&
        mapping[path.node.property.name]
      ) {
        path.node.property = j.identifier(mapping[path.node.property.name]);
      }
    });

  // Replace variable and parameter names
  root.find(j.Identifier)
    .forEach(path => {
      if (mapping[path.node.name]) {
        path.node.name = mapping[path.node.name];
      }
    });

  return root.toSource();
}; 
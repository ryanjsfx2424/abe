VN=7

target=version_history/v${VN}
mkdir version_history
mkdir $target
cp * $target
cp -r components $target
cp -r public $target
cp -r pages $target
cp -r styles $target
cp -r json $target
cp -r lib $target


#!/bin/bash

echo "#Treetagger installation (for tweet-visualization)" >> ~/.bashrc
echo "export PATH=$PATH:$(pwd)/treetagger/bin:$(pwd)/treetagger/cmd" >> ~/.bashrc
echo "export TREETAGGER=/opt/treetagger/cmd" >> ~/.bashrc
cd treetagger
sh install-tagger.sh
git clone https://github.com/miotto/treetagger-python.git
cd treetagger-python
python setup.py install
cd ../..
export PATH=$PATH:$(pwd)/treetagger/bin:$(pwd)/treetagger/cmd
export TREETAGGER=/opt/treetagger/cmd
echo 'Hello world!' | tree-tagger-english 
pip install -r requirements.txt
